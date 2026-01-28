# 🚀 Render.com Deployment Guide

## Prerequisites

1. ✅ GitHub account
2. ✅ Render.com account (free tier available)
3. ✅ MySQL database (can use Render's PostgreSQL or external MySQL)

---

## Step 1: Push Code to GitHub

```bash
cd "c:\Users\Dinesh\Documents\hrishi-main-pro\hrishikesh main project"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Push to GitHub
git push origin main
```

---

## Step 2: Setup Database on Render

### Option A: Use Render PostgreSQL (Recommended for Free Tier)

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `inventory-db`
4. Region: `Singapore`
5. Plan: `Free`
6. Click "Create Database"
7. **Copy the Internal Database URL** (starts with `postgresql://`)

### Option B: Use External MySQL

If you have MySQL hosted elsewhere:
- Copy your MySQL connection URL
- Format: `jdbc:mysql://host:port/database`

---

## Step 3: Deploy Application on Render

### Method 1: Using render.yaml (Automatic)

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Set environment variables:
   - `SPRING_DATASOURCE_URL`: Your database URL
   - `SPRING_DATASOURCE_USERNAME`: Database username
   - `SPRING_DATASOURCE_PASSWORD`: Database password
6. Click "Apply"

### Method 2: Manual Setup

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `inventory-management-system`
   - **Region**: `Singapore`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: `Free`

5. **Environment Variables** (Add these):
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://your-db-host:3306/hrishi_inventory_db
   SPRING_DATASOURCE_USERNAME=your_username
   SPRING_DATASOURCE_PASSWORD=your_password
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   SERVER_PORT=8082
   ```

6. Click "Create Web Service"

---

## Step 4: Wait for Deployment

- Build process will take 5-10 minutes
- Watch the logs in Render dashboard
- Look for: `Started InventoryApplication`

---

## Step 5: Access Your Application

Your app will be available at:
```
https://inventory-management-system.onrender.com
```

(Replace with your actual Render URL)

---

## 🔧 Troubleshooting

### Build Fails

**Error: "mvn: command not found"**
- ✅ Make sure you're using Docker environment
- ✅ Check `Dockerfile` exists in root directory

**Error: "Cannot connect to database"**
- ✅ Verify database URL is correct
- ✅ Check database username/password
- ✅ Ensure database is running

### Application Crashes

**Check logs:**
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

**Common issues:**
- Database connection timeout → Check firewall/network settings
- Port already in use → Render handles this automatically
- Out of memory → Upgrade to paid plan

---

## 📊 Database Migration

If using PostgreSQL instead of MySQL:

1. Update `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

2. Update `application-prod.properties`:
```properties
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

3. Database URL format:
```
jdbc:postgresql://host:port/database
```

---

## 🎯 Post-Deployment Checklist

- [ ] Application is accessible via Render URL
- [ ] Database connection working
- [ ] Can create vendors
- [ ] Can create products
- [ ] Can create orders
- [ ] Approve/Cancel buttons working
- [ ] Partial receipt working
- [ ] Payment tracking working

---

## 💰 Cost Estimate

**Free Tier:**
- Web Service: Free (sleeps after 15 min inactivity)
- PostgreSQL: Free (90 days, then $7/month)

**Paid Tier (if needed):**
- Web Service: $7/month (always on)
- PostgreSQL: $7/month

---

## 🔄 Updating Your Application

After making changes:

```bash
# Commit changes
git add .
git commit -m "Your update message"

# Push to GitHub
git push origin main
```

Render will automatically detect changes and redeploy!

---

## 🌐 Custom Domain (Optional)

1. Go to your service in Render
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Add your domain
5. Update DNS records as instructed

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:mysql://host:3306/db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `admin` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `password123` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Schema management | `update` |
| `SERVER_PORT` | Application port | `8082` |

---

## ✅ Success!

Your Inventory Management System is now live on Render.com! 🎉

**Share your app:**
```
https://your-app-name.onrender.com
```

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Spring Boot Docs: https://spring.io/guides
- Check application logs in Render dashboard
