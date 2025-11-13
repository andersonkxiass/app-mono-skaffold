# ---- Build Stage ----
FROM node:lts as builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy the root package.json, pnpm-lock.yaml, and pnpm-workspace.yaml
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the turbo.json file
COPY turbo.json ./

# Copy the source code for all applications and packages
COPY . .

# Install dependencies
RUN pnpm install

# Build the web application
RUN pnpm turbo build --filter=web

# ---- Production Stage ----
FROM node:lts-slim as production

# Create app user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Set the working directory
WORKDIR /app

# Copy Next.js standalone output
COPY --from=builder /usr/src/app/apps/web/.next/standalone ./
COPY --from=builder /usr/src/app/apps/web/.next/static ./apps/web/.next/static/

# Create public directory (since it may not exist)
RUN mkdir -p ./apps/web/public

# Change ownership to app user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check for Next.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the Next.js application using standalone server
CMD ["node", "apps/web/server.js"]