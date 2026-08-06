import bcrypt

password = b"admin"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print("Generated Hash:", hashed.decode('utf-8'))

is_valid = bcrypt.checkpw(password, hashed)
print("Is Valid:", is_valid)
