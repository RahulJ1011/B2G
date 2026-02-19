# 🚀 Deploy Crime Severity API to Azure App Service
## Using Docker + Azure Container Registry (ACR)

---

## 📋 Prerequisites

Install these tools on your machine before starting:

| Tool | Install |
|---|---|
| Azure CLI | https://learn.microsoft.com/en-us/cli/azure/install-azure-cli |
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Azure Subscription | https://portal.azure.com |

---

## STEP 1 — Login to Azure

```bash
az login
```

This opens a browser window. Sign in with your Azure account.

Verify login:
```bash
az account show
```

Set your subscription (if you have multiple):
```bash
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"
```

---

## STEP 2 — Create Azure Resource Group

A Resource Group is a logical container for all your Azure resources.

```bash
az group create \
  --name crime-severity-rg \
  --location eastus
```

> 💡 You can replace `eastus` with a region closer to your users:
> `centralindia`, `southeastasia`, `westeurope`, `australiaeast`, etc.

---

## STEP 3 — Create Azure Container Registry (ACR)

ACR is Azure's private Docker image registry.

```bash
az acr create \
  --resource-group crime-severity-rg \
  --name crimeseverityacr \
  --sku Basic \
  --admin-enabled true
```

> ⚠️ ACR name must be **globally unique**, lowercase, alphanumeric only.

Get your ACR login server URL:
```bash
az acr show \
  --name crimeseverityacr \
  --query loginServer \
  --output tsv
# Output: crimeseverityacr.azurecr.io
```

---

## STEP 4 — Build Docker Image Locally

Navigate to your project folder (where the Dockerfile is):

```bash
cd /path/to/crime_model
```

Build the Docker image:
```bash
docker build -t crime-severity-api:latest .
```

Test it locally first:
```bash
docker run -p 8000:8000 crime-severity-api:latest
```

Open browser → http://localhost:8000/docs
If the Swagger UI loads, your image is working. ✅

Stop the container:
```bash
docker stop $(docker ps -q)
```

---

## STEP 5 — Tag & Push Image to ACR

Login to ACR:
```bash
az acr login --name crimeseverityacr
```

Tag your local image with the ACR registry URL:
```bash
docker tag crime-severity-api:latest \
  crimeseverityacr.azurecr.io/crime-severity-api:latest
```

Push the image to ACR:
```bash
docker push crimeseverityacr.azurecr.io/crime-severity-api:latest
```

Verify the image is in ACR:
```bash
az acr repository list \
  --name crimeseverityacr \
  --output table
```

---

## STEP 6 — Create App Service Plan

The App Service Plan defines the compute resources (CPU/RAM) for your app.

```bash
az appservice plan create \
  --name crime-severity-plan \
  --resource-group crime-severity-rg \
  --is-linux \
  --sku B2
```

> **SKU options by load:**
> | SKU | Use case | vCPU | RAM |
> |-----|----------|------|-----|
> | B1  | Dev/test | 1    | 1.75 GB |
> | B2  | Low traffic | 2 | 3.5 GB |
> | P1v3 | Production | 2 | 8 GB |
> | P2v3 | High traffic | 4 | 16 GB |

---

## STEP 7 — Create & Deploy the Web App

Get your ACR credentials:
```bash
az acr credential show \
  --name crimeseverityacr \
  --query "{username:username, password:passwords[0].value}" \
  --output table
```

Create the Web App pointing to your ACR image:
```bash
az webapp create \
  --resource-group crime-severity-rg \
  --plan crime-severity-plan \
  --name crime-severity-api \
  --deployment-container-image-name crimeseverityacr.azurecr.io/crime-severity-api:latest
```

Configure ACR credentials on the Web App:
```bash
az webapp config container set \
  --name crime-severity-api \
  --resource-group crime-severity-rg \
  --docker-custom-image-name crimeseverityacr.azurecr.io/crime-severity-api:latest \
  --docker-registry-server-url https://crimeseverityacr.azurecr.io \
  --docker-registry-server-user crimeseverityacr \
  --docker-registry-server-password YOUR_ACR_PASSWORD
```

Set the startup port:
```bash
az webapp config appsettings set \
  --name crime-severity-api \
  --resource-group crime-severity-rg \
  --settings WEBSITES_PORT=8000
```

---

## STEP 8 — Verify Deployment

Get your app URL:
```bash
az webapp show \
  --name crime-severity-api \
  --resource-group crime-severity-rg \
  --query defaultHostName \
  --output tsv
# Output: crime-severity-api.azurewebsites.net
```

Test your live API:
```bash
# Health check
curl https://crime-severity-api.azurewebsites.net/health

# Predict severity
curl -X POST https://crime-severity-api.azurewebsites.net/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crime_type": "Assault",
    "location": "School / University",
    "description": "Suspect with knife threatened multiple students at night",
    "reporter_name": "Officer Singh"
  }'
```

API Docs (Swagger UI):
```
https://crime-severity-api.azurewebsites.net/docs
```

---

## STEP 9 — Enable Auto-Deploy (CI/CD) via GitHub Actions

Set up continuous deployment so every push to your repo re-deploys the app:

```bash
az webapp deployment container config \
  --name crime-severity-api \
  --resource-group crime-severity-rg \
  --enable-cd true
```

Get the webhook URL:
```bash
az webapp deployment container show-cd-url \
  --name crime-severity-api \
  --resource-group crime-severity-rg
```

Add this URL as a webhook in your ACR:
```bash
az acr webhook create \
  --name deploywebhook \
  --registry crimeseverityacr \
  --uri YOUR_WEBHOOK_URL \
  --actions push \
  --scope crime-severity-api:latest
```

Now every `docker push` to ACR auto-triggers a redeploy. ✅

---

## STEP 10 — Monitor & View Logs

Stream live logs:
```bash
az webapp log tail \
  --name crime-severity-api \
  --resource-group crime-severity-rg
```

View deployment logs in Azure Portal:
```
portal.azure.com → App Services → crime-severity-api → Deployment Center
```

---

## 🔒 Optional: Enable HTTPS-Only & Custom Domain

Force HTTPS:
```bash
az webapp update \
  --name crime-severity-api \
  --resource-group crime-severity-rg \
  --https-only true
```

---

## 🧹 Cleanup (when done)

Delete everything to avoid charges:
```bash
az group delete \
  --name crime-severity-rg \
  --yes --no-wait
```

---

## 📦 Quick Reference — All Commands in Order

```bash
# 1. Login
az login

# 2. Resource Group
az group create --name crime-severity-rg --location eastus

# 3. ACR
az acr create --resource-group crime-severity-rg --name crimeseverityacr --sku Basic --admin-enabled true

# 4. Build & test locally
docker build -t crime-severity-api:latest .
docker run -p 8000:8000 crime-severity-api:latest

# 5. Push to ACR
az acr login --name crimeseverityacr
docker tag crime-severity-api:latest crimeseverityacr.azurecr.io/crime-severity-api:latest
docker push crimeseverityacr.azurecr.io/crime-severity-api:latest

# 6. App Service Plan
az appservice plan create --name crime-severity-plan --resource-group crime-severity-rg --is-linux --sku B2

# 7. Web App
az webapp create --resource-group crime-severity-rg --plan crime-severity-plan --name crime-severity-api --deployment-container-image-name crimeseverityacr.azurecr.io/crime-severity-api:latest
az webapp config appsettings set --name crime-severity-api --resource-group crime-severity-rg --settings WEBSITES_PORT=8000

# 8. Done! Visit:
# https://crime-severity-api.azurewebsites.net/docs
```
