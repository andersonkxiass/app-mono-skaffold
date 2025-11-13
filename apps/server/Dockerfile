# ---- Build Stage ----
FROM node:lts as builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy all monorepo files (simpler and more reliable)
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build contracts package first (required by server)
RUN pnpm --filter @awesome-app/contracts build

# Build the server application
RUN pnpm --filter server build

# ---- Production Stage ----
FROM node:lts-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo configuration
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder /usr/src/app/.npmrc ./

# Copy package.json files for workspace resolution
COPY --from=builder /usr/src/app/apps/server/package.json ./apps/server/
COPY --from=builder /usr/src/app/packages/contracts/package.json ./packages/contracts/

# Copy built server application
COPY --from=builder /usr/src/app/apps/server/dist ./apps/server/dist

# Copy built contracts package
COPY --from=builder /usr/src/app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /usr/src/app/packages/contracts/package.json ./packages/contracts/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Set the working directory to the server application
WORKDIR /usr/src/app/apps/server

# Expose the port the app runs on
EXPOSE 3000
ENV PORT=3000

# Define the command to run the application
CMD [ "node", "dist/index.js" ]