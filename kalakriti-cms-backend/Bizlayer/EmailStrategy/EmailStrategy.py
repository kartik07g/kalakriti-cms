import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmailStrategy(ABC):
    """
    Abstract base class for email sending strategies.
    """
    
    @abstractmethod
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False) -> bool:
        """
        Send an email to a recipient.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        pass
    
    @abstractmethod
    def send_bulk_email(self, to_emails: List[str], subject: str, body: str, html: bool = False) -> Dict[str, bool]:
        """
        Send emails to multiple recipients.
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            Dict[str, bool]: Dictionary mapping email addresses to success status
        """
        pass


class SMTPEmailStrategy(EmailStrategy):
    """
    Email strategy implementation using SMTP.
    """
    
    def __init__(
        self, 
        smtp_server: str = None, 
        smtp_port: int = None, 
        smtp_username: str = None, 
        smtp_password: str = None,
        from_email: str = None,
        use_tls: bool = True
    ):
        """
        Initialize SMTP email strategy.
        
        Args:
            smtp_server: SMTP server address (default: from env SMTP_SERVER)
            smtp_port: SMTP server port (default: from env SMTP_PORT)
            smtp_username: SMTP username (default: from env SMTP_USERNAME)
            smtp_password: SMTP password (default: from env SMTP_PASSWORD)
            from_email: Sender email address (default: from env FROM_EMAIL)
            use_tls: Whether to use TLS (default: True)
        """
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_username = "kalakritievents07@gmail.com"
        self.smtp_password = "dfbh fcfr vbrl nrsa"
        self.from_email = "kalakritievents07@gmail.com"
        self.use_tls = use_tls
        
        if not all([self.smtp_server, self.smtp_port, self.smtp_username, self.smtp_password, self.from_email]):
            raise ValueError("Missing required SMTP configuration. Check environment variables or constructor parameters.")
    
    def _create_message(self, to_email: str, subject: str, body: str, html: bool = False) -> MIMEMultipart:
        """
        Create an email message.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML
            
        Returns:
            MIMEMultipart: Email message
        """
        message = MIMEMultipart()
        message["From"] = self.from_email
        message["To"] = to_email
        message["Subject"] = subject
        
        # Attach body with appropriate content type
        content_type = "html" if html else "plain"
        message.attach(MIMEText(body, content_type))
        
        return message
    
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False) -> bool:
        """
        Send an email to a recipient.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        message = self._create_message(to_email, subject, body, html)
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(message)
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    def send_bulk_email(self, to_emails: List[str], subject: str, body: str, html: bool = False) -> Dict[str, bool]:
        """
        Send emails to multiple recipients.
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            Dict[str, bool]: Dictionary mapping email addresses to success status
        """
        results = {}
        
        for email in to_emails:
            results[email] = self.send_email(email, subject, body, html)
            
        return results


class MockEmailStrategy(EmailStrategy):
    """
    Mock email strategy for testing.
    """
    
    def __init__(self):
        self.sent_emails = []
    
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False) -> bool:
        """
        Mock sending an email (just stores it in memory).
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            bool: Always True
        """
        self.sent_emails.append({
            "to": to_email,
            "subject": subject,
            "body": body,
            "html": html
        })
        print(f"Mock email sent to {to_email}: {subject}")
        return True
    
    def send_bulk_email(self, to_emails: List[str], subject: str, body: str, html: bool = False) -> Dict[str, bool]:
        """
        Mock sending emails to multiple recipients.
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            body: Email body content
            html: Whether the body is HTML (default: False)
            
        Returns:
            Dict[str, bool]: Dictionary mapping email addresses to True
        """
        results = {}
        
        for email in to_emails:
            results[email] = self.send_email(email, subject, body, html)
            
        return results
    
    def get_sent_emails(self) -> List[Dict[str, Any]]:
        """
        Get all sent emails.
        
        Returns:
            List[Dict[str, Any]]: List of sent emails
        """
        return self.sent_emails
    
    def clear_sent_emails(self) -> None:
        """
        Clear the list of sent emails.
        """
        self.sent_emails = []


# Factory function to create the appropriate email strategy
def create_email_strategy(strategy_type: str = "smtp", **kwargs) -> EmailStrategy:
    """
    Create an email strategy instance.
    
    Args:
        strategy_type: Type of email strategy ("smtp" or "mock")
        **kwargs: Additional arguments to pass to the strategy constructor
        
    Returns:
        EmailStrategy: Email strategy instance
    """
    if strategy_type.lower() == "smtp":
        return SMTPEmailStrategy(**kwargs)
    elif strategy_type.lower() == "mock":
        return MockEmailStrategy()
    else:
        raise ValueError(f"Unknown email strategy type: {strategy_type}")