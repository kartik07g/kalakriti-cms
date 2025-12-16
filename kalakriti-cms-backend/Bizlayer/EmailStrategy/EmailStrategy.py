import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from abc import ABC, abstractmethod

class EmailStrategy(ABC):
    @abstractmethod
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False):
        pass

class SMTPEmailStrategy(EmailStrategy):
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_username = "kalakritievents07@gmail.com"
        self.smtp_password = "dfbh fcfr vbrl nrsa"
        self.from_email = "kalakritievents07@gmail.com"
    
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            print(f"Email sent successfully to {to_email}")
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")