import "@stdlib/deploy";

// Contract for handling tgBTC payment requests
contract TgBtcRequest with Deployable {
    // State variables
    sender: Address;
    receiver: Address;
    amount: Int;
    message: String?;
    expiresAt: Int?;
    isPaid: Bool;
    
    // Initialize the contract
    init(sender: Address, receiver: Address, amount: Int, message: String?, expiresAt: Int?) {
        self.sender = sender;
        self.receiver = receiver;
        self.amount = amount;
        self.message = message;
        self.expiresAt = expiresAt;
        self.isPaid = false;
    }
    
    // Receive tgBTC payment
    receive("pay") {
        // Ensure the contract is not already paid
        require(!self.isPaid, "Request already paid");
        
        // Check if the request has expired
        if (self.expiresAt != null) {
            require(now() <= self.expiresAt!!, "Request has expired");
        }
        
        // Ensure the payment amount is correct
        require(context().value >= self.amount, "Insufficient payment amount");
        
        // Mark as paid
        self.isPaid = true;
        
        // Transfer the payment to the receiver
        send(SendParameters{
            to: self.receiver,
            value: context().value,
            mode: SendIgnoreErrors
        });
    }
    
    // Allow the sender to cancel and refund if expired
    receive("refund") {
        // Only the sender can request a refund
        require(context().sender == self.sender, "Only sender can refund");
        
        // Ensure the request has expired
        require(self.expiresAt != null, "Request has no expiration");
        require(now() > self.expiresAt!!, "Request has not expired yet");
        
        // Ensure the request is not already paid
        require(!self.isPaid, "Request already paid");
        
        // Mark as paid to prevent further interactions
        self.isPaid = true;
        
        // Return any contract balance to the sender
        send(SendParameters{
            to: self.sender,
            value: myBalance() - context().value,
            mode: SendIgnoreErrors
        });
    }
    
    // Get request details
    get fun getDetails(): (Address, Address, Int, String?, Int?, Bool) {
        return (self.sender, self.receiver, self.amount, self.message, self.expiresAt, self.isPaid);
    }
    
    // Check if the request is expired
    get fun isExpired(): Bool {
        if (self.expiresAt == null) {
            return false;
        }
        return now() > self.expiresAt!!;
    }
}
