from pathlib import Path
import sys
import getpass

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from auth.security import hash_password
from main import SessionLocal, User

def create_admin() -> None:
    print("SentinelLock Admin Bootstrap")
    print("-" * 30)

    full_name = input("Admin full name: ").strip()
    email = input("Admin email: ").strip().lower()

    if not full_name:
        print("Error: full name is required.")
        sys.exit(1)

    if not email or "@" not in email:
        print("Error: a valid email address is required.")
        sys.exit(1)

    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if len(password) < 8:
        print("Error: password must contain at least 8 characters.")
        sys.exit(1)

    if password != confirm_password:
        print("Error: passwords do not match.")
        sys.exit(1)

    with SessionLocal() as db:
        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            print("Error: an account with this email already exists.")
            sys.exit(1)

        admin = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role="admin",
            is_active=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("Admin account created successfully.")
        print(f"Admin ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Role: {admin.role}")


if __name__ == "__main__":
    create_admin()