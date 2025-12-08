from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.core.dependencies import get_current_instructor
from app.core.s3 import s3_service
from app.models.instructor import Instructor
from typing import List

router = APIRouter()


@router.post("/upload/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_instructor: Instructor = Depends(get_current_instructor)
):
    """
    Upload an image file (thumbnail, profile image, etc.)

    Allowed formats: jpg, jpeg, png, gif, webp
    Max size: 10MB
    """
    # Check file extension
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Check file size (10MB limit)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )

    try:
        # Upload to S3
        file_url = await s3_service.upload_file(
            file_content=content,
            filename=file.filename,
            content_type=file.content_type,
            folder=f"instructors/{current_instructor.id}/images"
        )

        return {
            "url": file_url,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/upload/video", status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    current_instructor: Instructor = Depends(get_current_instructor)
):
    """
    Upload a video file

    Allowed formats: mp4, avi, mov, wmv, flv
    Max size: 500MB
    """
    # Check file extension
    allowed_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv']
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Check file size (500MB limit)
    content = await file.read()
    if len(content) > 500 * 1024 * 1024:  # 500MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 500MB limit"
        )

    try:
        # Upload to S3
        file_url = await s3_service.upload_file(
            file_content=content,
            filename=file.filename,
            content_type=file.content_type,
            folder=f"instructors/{current_instructor.id}/videos"
        )

        return {
            "url": file_url,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/upload/document", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_instructor: Instructor = Depends(get_current_instructor)
):
    """
    Upload a document file (ebook, PDF, etc.)

    Allowed formats: pdf, epub, mobi, doc, docx
    Max size: 50MB
    """
    # Check file extension
    allowed_extensions = ['pdf', 'epub', 'mobi', 'doc', 'docx']
    file_extension = file.filename.split('.')[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Check file size (50MB limit)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 50MB limit"
        )

    try:
        # Upload to S3
        file_url = await s3_service.upload_file(
            file_content=content,
            filename=file.filename,
            content_type=file.content_type,
            folder=f"instructors/{current_instructor.id}/documents"
        )

        return {
            "url": file_url,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/upload")
async def delete_file(
    file_url: str,
    current_instructor: Instructor = Depends(get_current_instructor)
):
    """
    Delete a file from S3

    Note: This only deletes the file if it belongs to the current instructor
    """
    # Check if the file URL belongs to the current instructor
    if f"instructors/{current_instructor.id}" not in file_url:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this file"
        )

    try:
        success = await s3_service.delete_file(file_url)

        if success:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
