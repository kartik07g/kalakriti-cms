import os
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
from pathlib import Path

class FileUploadStrategy:
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "local")
        
    async def upload_file(self, file: UploadFile, folder: str = "uploads") -> str:
        if self.environment == "prod":
            return await self._upload_to_s3(file, folder)
        else:
            return await self._upload_locally(file, folder)
    
    async def _upload_to_s3(self, file: UploadFile, folder: str) -> str:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        
        bucket_name = os.getenv("S3_BUCKET_NAME")
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        s3_key = f"{folder}/{unique_filename}"
        
        try:
            file_content = await file.read()
            s3_client.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type
            )
            return f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        except ClientError as e:
            raise Exception(f"Failed to upload to S3: {str(e)}")
    
    async def _upload_locally(self, file: UploadFile, folder: str) -> str:
        upload_dir = Path("uploads") / folder
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = upload_dir / unique_filename
        
        file_content = await file.read()
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return f"/uploads/{folder}/{unique_filename}"

upload_strategy = FileUploadStrategy()