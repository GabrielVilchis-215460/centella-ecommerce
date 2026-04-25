"""
app/services/archivos_service.py
Cloudflare R2 client
"""

import time
from typing import Dict
import boto3
from app.config import settings


class CloudflareR2Client:
    """Handles uploads to Cloudflare R2"""
    
    def __init__(self):
        self.account_id = settings.BUCKET_ACCOUNT_ID
        self.bucket_name = settings.BUCKET_NAME
        self.public_url = settings.BUCKET_API
        
        base_url = f"https://{settings.BUCKET_ACCOUNT_ID}.r2.cloudflarestorage.com"
        
        self.s3 = boto3.client(
            service_name="s3",
            endpoint_url=base_url,
            aws_access_key_id=settings.BUCKET_ACCESS_KEY,
            aws_secret_access_key=settings.BUCKET_ACCESS_KEY_SECRET,
            region_name="auto"
        )
    
    def upload_image(self, file_data: bytes, filename: str) -> Dict:
        """Upload image to R2"""
        try:
            timestamp = int(time.time() * 1000)
            name = filename.split('.')[0]
            ext = filename.split('.')[-1]
            key = f"{name}_{timestamp}.{ext}"
            
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data
            )
            
            return {
                "success": True,
                "key": key,
                "url": f"{self.public_url}/{key}",
                "size": len(file_data)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def generate_presigned_download_url(self, key: str, expires_in: int = 3600) -> Dict:
        """Generate presigned URL for downloading a file"""
        try:
            url = self.s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            
            return {
                "success": True,
                "url": url,
                "key": key,
                "expires_in": expires_in
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
         
    def delete_image(self, key: str) -> Dict:
        """Delete image from R2"""
        try:
            self.s3.delete_object(Bucket=self.bucket_name, Key=key)
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}