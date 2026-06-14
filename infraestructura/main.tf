terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 3. Crear un Grupo de Recursos (La "caja" de nuestro proyecto)
resource "azurerm_resource_group" "pos_rg" {
  name     = "rg-pos-system-eval"
  location = "Canada Central" 
}

# 4. Generar una contraseña segura aleatoria para la BD
resource "random_password" "db_password" {
  length           = 16
  special          = true       
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 5. Servidor PostgreSQL (Flexible Server - Versión económica B1ms)
resource "azurerm_postgresql_flexible_server" "pos_db_server" {
  name                   = "pos-db-server-eval2026" # Si te da error, cámbiale un número al final, debe ser único en todo Azure
  resource_group_name    = azurerm_resource_group.pos_rg.name
  location               = azurerm_resource_group.pos_rg.location
  version                = "14"
  administrator_login    = "posadmin"
  administrator_password = random_password.db_password.result
  storage_mb             = 32768 # 32 GB (Mínimo permitido)
  sku_name               = "B_Standard_B1ms" # Capa económica
  zone                   = "1"
}

# 6. Base de datos específica para el POS
resource "azurerm_postgresql_flexible_server_database" "pos_db" {
  name      = "pos_db_prod" # <--- Solo cambiamos el nombre aquí
  server_id = azurerm_postgresql_flexible_server.pos_db_server.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 7. Regla de Firewall para permitir que otros servicios de Azure se conecten
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAllAzureServicesAndIPs"
  server_id        = azurerm_postgresql_flexible_server.pos_db_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# 8. Almacenamiento para las imágenes de los productos (Reemplazo de 'uploads/')
resource "azurerm_storage_account" "pos_storage" {
  name                     = "posstorageeval2026" # Solo minúsculas y números, también debe ser único
  resource_group_name      = azurerm_resource_group.pos_rg.name
  location                 = azurerm_resource_group.pos_rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS" # Redundancia local (la más barata)
}

# 9. Contenedor específico para las imágenes
resource "azurerm_storage_container" "product_images" {
  name                  = "product-images"
  storage_account_name  = azurerm_storage_account.pos_storage.name
  container_access_type = "blob" # Permite lectura pública para que el frontend pueda mostrar las fotos
}

# 10. Plan de Servicio (El "Hardware" del servidor web - Capa Gratuita)
resource "azurerm_service_plan" "pos_app_plan" {
  name                = "pos-app-plan-eval2026"
  resource_group_name = azurerm_resource_group.pos_rg.name
  location            = azurerm_resource_group.pos_rg.location
  os_type             = "Linux"
  sku_name            = "F1" # Capa F1 es 100% gratuita. (Si falla, la cambiamos a "B1")
}

# 11. App Service (El entorno donde correrá Node.js)
resource "azurerm_linux_web_app" "pos_backend" {
  name                = "pos-backend-api-eval2026-v2" # <--- Solo agregamos -v2 aquí
  resource_group_name = azurerm_resource_group.pos_rg.name
  location            = azurerm_service_plan.pos_app_plan.location
  service_plan_id     = azurerm_service_plan.pos_app_plan.id

  site_config {
    always_on = false
    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    "DB_HOST"     = azurerm_postgresql_flexible_server.pos_db_server.fqdn
    "DB_USER"     = azurerm_postgresql_flexible_server.pos_db_server.administrator_login
    "DB_PASSWORD" = azurerm_postgresql_flexible_server.pos_db_server.administrator_password
    "DB_NAME"     = azurerm_postgresql_flexible_server_database.pos_db.name
  }
}
# 12. Outputs (Información vital para conectarnos)
output "database_host" {
  description = "La dirección del servidor PostgreSQL"
  value       = azurerm_postgresql_flexible_server.pos_db_server.fqdn
}

output "database_user" {
  description = "El usuario administrador"
  value       = azurerm_postgresql_flexible_server.pos_db_server.administrator_login
}

output "database_password" {
  description = "La contraseña generada automáticamente"
  value       = random_password.db_password.result
  sensitive   = true # La oculta por defecto por seguridad
}

output "webapp_url" {
  description = "La URL pública de tu Backend"
  value       = "https://${azurerm_linux_web_app.pos_backend.default_hostname}"
}