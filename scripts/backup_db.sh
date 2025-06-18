#!/bin/bash

# Configura estos valores según tu entorno
PGUSER="museo_user"         # Usuario de PostgreSQL
PGHOST="146.190.119.145"        # Host de PostgreSQL
PGDATABASE="hackbam_db"     # Nombre de la base de datos
BACKUP_FILE="respaldo_museo3d.backup" # Nombre del archivo de respaldo

# Solicita la contraseña de forma interactiva
read -s -p "Contraseña de PostgreSQL para $PGUSER: " PGPASSWORD
export PGPASSWORD

echo "\nIniciando respaldo..."

# Realiza el respaldo
pg_dump -U "$PGUSER" -h "$PGHOST" -d "$PGDATABASE" -F c -b -v -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Respaldo completado: $BACKUP_FILE"
else
  echo "Error al realizar el respaldo."
fi

pg_dump --version 