from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from . import crud, models
from .database import get_db
from .security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = decode_access_token(token)
    if token_data is None:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.username)
    if user is None:
        raise credentials_exception
    return user
