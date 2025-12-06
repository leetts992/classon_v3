import boto3
from botocore.exceptions import ClientError
from typing import Optional
import uuid
from datetime import datetime
from app.core.config import settings

class S3Service:
    def __init__(self):
        self.s3_client = None
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )

    def is_configured(self) -> bool:
        """Check if S3 is properly configured"""
        return self.s3_client is not None and bool(settings.S3_BUCKET_NAME)

    def generate_unique_filename(self, original_filename: str) -> str:
        """Generate unique filename with timestamp and UUID"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        extension = original_filename.split('.')[-1] if '.' in original_filename else ''

        if extension:
            return f"{timestamp}_{unique_id}.{extension}"
        return f"{timestamp}_{unique_id}"

    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        folder: str = "uploads"
    ) -> Optional[str]:
        """
        Upload file to S3 and return the file URL

        Args:
            file_content: File content in bytes
            filename: Original filename
            content_type: MIME type of the file
            folder: S3 folder path (default: "uploads")

        Returns:
            File URL if successful, None otherwise
        """
        if not self.is_configured():
            raise Exception("S3 is not configured. Please set AWS credentials and bucket name.")

        try:
            # Generate unique filename
            unique_filename = self.generate_unique_filename(filename)
            s3_key = f"{folder}/{unique_filename}"

            # Upload to S3
            self.s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type
            )

            # Generate URL
            file_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            return file_url

        except ClientError as e:
            print(f"Error uploading file to S3: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    async def delete_file(self, file_url: str) -> bool:
        """
        Delete file from S3

        Args:
            file_url: Full URL of the file to delete

        Returns:
            True if successful, False otherwise
        """
        if not self.is_configured():
            return False

        try:
            # Extract S3 key from URL
            # Format: https://bucket-name.s3.region.amazonaws.com/folder/filename
            s3_key = file_url.split('.amazonaws.com/')[-1]

            self.s3_client.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key
            )
            return True

        except ClientError as e:
            print(f"Error deleting file from S3: {e}")
            return False


# Global S3 service instance
s3_service = S3Service()
