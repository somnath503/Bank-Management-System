package com.Banking_Somnath.banking_systemn.service;

import com.Banking_Somnath.banking_systemn.model.Customer;
import com.Banking_Somnath.banking_systemn.model.Transaction;
import com.Banking_Somnath.banking_systemn.repository.CustomerRepository;
import com.Banking_Somnath.banking_systemn.repository.TransactionRepository;
import com.Banking_Somnath.banking_systemn.request.TransferMoney;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
@Service
public class TransactionService {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    TransactionRepository transactionRepository;

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);


    public String getBalance(String customerId) {


        Optional<Customer> customerList = customerRepository.findByCustomerId(customerId);
        System.out.println("✅ Looking for customer ID: " + customerId);

        if (!customerList.isEmpty()) {
            Customer c = customerList.get();
            System.out.println("✅ Found customer: " + c.getCustomerId() + ", Balance: " + c.getBalance());
            return String.format("%.2f", c.getBalance());
        } else {
            System.out.println("❌ Customer not found.");
            return "ERROR:Customer_Not_Found";
        }
    }

    @Transactional
    public String Transfer(Customer sender, TransferMoney transferMoney){

        double amount = transferMoney.getAmount();
//        String senderPassword = transferMoney.getSenderPassword(); // <--- UNCOMMENTED
        String receiverCustomerId= transferMoney.getReceiverCustomerId();
        String receiverMobileNo= transferMoney.getReceiverMobileNo();

        log.info("Attempting transfer from {} to {} (Mobile: {}) amount: {}", sender.getCustomerId(), receiverCustomerId, receiverMobileNo, amount);
        if (amount <= 0) { // Use <= 0 for validation
            log.warn("Transfer failed: Amount must be positive. Amount: {}", amount);
            return "ERROR:Amount must be positive";
        }

        // Re-enabled password check
//        if (senderPassword == null || senderPassword.trim().isEmpty()) { // Good practice to check if password was provided
//            log.warn("Transfer failed: Sender password not provided by {}", sender.getCustomerId());
//            return "ERROR:Password is required for transfer.";
//        }
//        if (!passwordEncoder.matches(senderPassword, sender.getPassword())) { // <--- UNCOMMENTED
//            log.warn("Transfer failed: Incorrect password for sender {}", sender.getCustomerId());
//            return "ERROR:Incorrect password!";
//        }

        if (sender.getBalance() < amount) {
            log.warn("Transfer failed: Insufficient balance for sender {}. Required: {}, Available: {}", sender.getCustomerId(), amount, sender.getBalance());
            return "ERROR:Insufficient balance!";
        }

        if (sender.getCustomerId().equals(receiverCustomerId)) {
            log.warn("Transfer failed: Sender {} attempting to transfer to self.", sender.getCustomerId());
            return "ERROR:Cannot transfer to yourself.";
        }

        Optional<Customer> receiverOpt = customerRepository.findByCustomerId(receiverCustomerId);
        if (receiverOpt.isEmpty()) {
            log.warn("Transfer failed: Receiver account not found with Customer ID: {}", receiverCustomerId);
            return "ERROR:Receiver account not found.";
        }

        Customer receiver = receiverOpt.get();
        // Add mobile number validation as an extra check
        if (!receiver.getMobileNumber().equals(receiverMobileNo)) {
            log.warn("Transfer failed: Receiver details mismatch for Customer ID: {}. Expected Mobile: {}, Provided: {}", receiverCustomerId, receiver.getMobileNumber(), receiverMobileNo);
            return "ERROR:Receiver details mismatch.";
        }

        sender.setBalance(sender.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);
        customerRepository.save(sender);
        customerRepository.save(receiver);
        log.info("Balances updated successfully for sender {} and receiver {}.", sender.getCustomerId(), receiver.getCustomerId());


        Transaction senderTx = new Transaction();
        senderTx.setCustomerId(sender.getCustomerId()); // Sender's Customer ID
        senderTx.setMobileNo(sender.getMobileNumber()); // Use relevant mobile number
        senderTx.setType("TRANSFER_OUT"); // Use clearer type
        senderTx.setBalance(amount); // Record the transaction amount
        senderTx.setDescription("Transferred ₹" + String.format("%.2f", amount) + " to " + receiver.getCustomerId() + " (Acc: " + receiver.getAccountNumber() + ")");
        senderTx.setLocalDateTime(LocalDateTime.now());
        senderTx.setSenderAccountNumber(sender.getAccountNumber());
        senderTx.setRecipientAccountNumber(receiver.getAccountNumber());
        senderTx.setBranchCode(sender.getBranchCode()); // Sender's branch context might be relevant
        senderTx.setIfscCode(sender.getIfsCode());     // Sender's IFSC context
        senderTx.setSenderMobileNo(sender.getMobileNumber());
        senderTx.setRecipientMobileNo(receiver.getMobileNumber());
        transactionRepository.save(senderTx);
        log.info("Saved sender transaction record for {}.", sender.getCustomerId());

        // Receiver Transaction Record
        Transaction receiverTx = new Transaction();
        receiverTx.setCustomerId(receiver.getCustomerId());
        receiverTx.setMobileNo(receiver.getMobileNumber());
        receiverTx.setType("TRANSFER_IN");
        receiverTx.setBalance(amount);
        receiverTx.setDescription("Received ₹" + String.format("%.2f", amount) + " from " + sender.getCustomerId() + " (Acc: " + sender.getAccountNumber() + ")");
        receiverTx.setLocalDateTime(LocalDateTime.now());
        receiverTx.setSenderAccountNumber(sender.getAccountNumber());
        receiverTx.setRecipientAccountNumber(receiver.getAccountNumber());
        receiverTx.setBranchCode(receiver.getBranchCode()); // Receiver's branch context (should be receiver.getBranchCode())
        receiverTx.setIfscCode(receiver.getIfsCode());     // Receiver's IFSC context (should be receiver.getIfsCode())
        receiverTx.setSenderMobileNo(sender.getMobileNumber());
        receiverTx.setRecipientMobileNo(receiver.getMobileNumber());
        transactionRepository.save(receiverTx);
        log.info("Saved receiver transaction record for {}.", receiver.getCustomerId());

        return "Money transfer successful. ₹" + String.format("%.2f", amount) + " has been transferred to " + receiver.getCustomerId();
    }

    @Transactional(readOnly = true)
    public byte[] generateTransactionHistoryPdf(String customerId, LocalDate startDate, LocalDate endDate) throws Exception {
        log.info("Generating transaction history PDF for Customer ID: {} from {} to {}", customerId, startDate, endDate);

        Optional<Customer> customerOpt = customerRepository.findByCustomerId(customerId);
        if (customerOpt.isEmpty()) {
            log.error("Customer details not found for PDF generation: {}", customerId);
            throw new RuntimeException("Customer details not found for PDF generation: " + customerId);
        }
        Customer customer = customerOpt.get();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX); // Ensure end date is inclusive

        log.debug("Querying transactions between {} and {}", startDateTime, endDateTime);

        // Fetch transactions for the customer within the date range
        List<Transaction> transactions = transactionRepository.findByCustomerIdAndLocalDateTimeBetweenOrderByLocalDateTimeDesc(
                customerId,
                startDateTime,
                endDateTime
        );

        log.info("Found {} transactions for Customer ID: {}", transactions.size(), customerId);

        // --- PDF Generation Logic ---
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36); // Added margins (left, right, top, bottom)
        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            // Optional: Add Header/Footer Events for page numbers etc. (more advanced)
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY);

            // Title Section
            Paragraph title = new Paragraph("Transaction History", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            Paragraph dateRange = new Paragraph(
                    "For Period: " + startDate.format(dateFormatter) + " to " + endDate.format(dateFormatter),
                    infoFont);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            dateRange.setSpacingAfter(10f);
            document.add(dateRange);


            // Customer Information Section
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1f, 3f});
            infoTable.setSpacingAfter(15f);
            infoTable.getDefaultCell().setBorder(Rectangle.NO_BORDER); // No borders for info table cells

            infoTable.addCell(new Phrase("Customer Name:", infoFont));
            infoTable.addCell(new Phrase(customer.getFname() + " " + customer.getLname(), infoFont));
            infoTable.addCell(new Phrase("Customer ID:", infoFont));
            infoTable.addCell(new Phrase(customer.getCustomerId(), infoFont));
            infoTable.addCell(new Phrase("Account Number:", infoFont));
            infoTable.addCell(new Phrase(customer.getAccountNumber(), infoFont));
            infoTable.addCell(new Phrase("Mobile Number:", infoFont));
            infoTable.addCell(new Phrase(customer.getMobileNumber(), infoFont));
            // Optional: Add current balance if needed, but statement usually shows transactions
            // infoTable.addCell(new Phrase("Balance as of " + LocalDate.now().format(dateFormatter) + ":", infoFont));
            // infoTable.addCell(new Phrase("₹" + String.format("%.2f", customer.getBalance()), infoFont));
            document.add(infoTable);


            // Transactions Table
            if (transactions.isEmpty()) {
                Paragraph noData = new Paragraph("No transactions found for the selected period.", infoFont);
                noData.setAlignment(Element.ALIGN_CENTER);
                document.add(noData);
            } else {
                PdfPTable table = new PdfPTable(5); // Date/Time, Description, Type, Amount, Counterparty/Details
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                table.setWidths(new float[]{2f, 3.5f, 1.5f, 1.5f, 2.5f}); // Adjusted widths

                // Table Header
                PdfPCell cell = new PdfPCell(new Phrase("Date & Time", headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY); cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setPadding(5); table.addCell(cell);
                cell = new PdfPCell(new Phrase("Description", headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY); cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setPadding(5); table.addCell(cell);
                cell = new PdfPCell(new Phrase("Type", headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY); cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setPadding(5); table.addCell(cell);
                cell = new PdfPCell(new Phrase("Amount (₹)", headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY); cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setPadding(5); table.addCell(cell);
                cell = new PdfPCell(new Phrase("Details", headerFont));
                cell.setBackgroundColor(BaseColor.DARK_GRAY); cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setPadding(5); table.addCell(cell);
                table.setHeaderRows(1);

                // Table Data
                DateTimeFormatter tableDateFormatter = DateTimeFormatter.ofPattern("dd-MM-yy HH:mm:ss");
                BaseColor creditColor = new BaseColor(0, 128, 0); // Green
                BaseColor debitColor = BaseColor.RED;

                for (Transaction tx : transactions) {
                    // Date/Time
                    PdfPCell dataCell = new PdfPCell(new Phrase(tx.getLocalDateTime().format(tableDateFormatter), dataFont));
                    dataCell.setPadding(4); dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE); table.addCell(dataCell);

                    // Description
                    dataCell = new PdfPCell(new Phrase(tx.getDescription() != null ? tx.getDescription() : "-", dataFont));
                    dataCell.setPadding(4); dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE); table.addCell(dataCell);

                    // Type
                    dataCell = new PdfPCell(new Phrase(tx.getType() != null ? tx.getType().replace("_", " ") : "-", dataFont)); // Replace underscore for readability
                    dataCell.setPadding(4); dataCell.setHorizontalAlignment(Element.ALIGN_CENTER); dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE); table.addCell(dataCell);

                    // Amount (with color coding)
                    Font amountFont = new Font(dataFont);
                    String amountStr = String.format("%.2f", tx.getBalance()); // Balance holds the transaction amount here
                    if (tx.getType() != null && (tx.getType().contains("IN") || tx.getType().contains("DEPOSIT"))) {
                        amountFont.setColor(creditColor);
                        amountStr = "+ " + amountStr;
                    } else if (tx.getType() != null && (tx.getType().contains("OUT") || tx.getType().contains("WITHDRAW"))) {
                        amountFont.setColor(debitColor);
                        amountStr = "- " + amountStr;
                    }
                    dataCell = new PdfPCell(new Phrase(amountStr, amountFont));
                    dataCell.setPadding(4); dataCell.setHorizontalAlignment(Element.ALIGN_RIGHT); dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE); table.addCell(dataCell);


                    // Details / Counterparty
                    String details = "-";
                    if ("TRANSFER_OUT".equals(tx.getType())) {
                        details = "To: " + (tx.getRecipientAccountNumber() != null ? tx.getRecipientAccountNumber() : "N/A");
                    } else if ("TRANSFER_IN".equals(tx.getType())) {
                        details = "From: " + (tx.getSenderAccountNumber() != null ? tx.getSenderAccountNumber() : "N/A");
                    } else if ("DEPOSIT".equals(tx.getType())) {
                        details = "Self Deposit"; // Example
                    } else if ("WITHDRAWAL".equals(tx.getType())) {
                        details = "Self Withdrawal"; // Example
                    }
                    dataCell = new PdfPCell(new Phrase(details, dataFont));
                    dataCell.setPadding(4); dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE); table.addCell(dataCell);
                }
                document.add(table);
            }

            // Footer
            Paragraph footer = new Paragraph(
                    "Report generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss")) +
                            " | This is a computer-generated statement and requires no signature.",
                    footerFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(15f);
            document.add(footer);

        } catch (DocumentException e) {
            log.error("Error during PDF document generation for customer {}: {}", customerId, e.getMessage(), e);
            throw new Exception("Error generating PDF document.", e); // Re-throw as a checked exception or specific runtime exception
        } finally {
            if (document.isOpen()) {
                document.close(); // Essential to finalize the PDF
            }
        }
        log.info("Successfully generated PDF byte array for customer {}", customerId);
        return baos.toByteArray();
    }

    // Keep getBalance method as is
    // ...
}












