FROM public.ecr.aws/docker/library/node:18.13.0-buster as builder

# Used for install jerry private repo dependencies
ARG GIT_CREDENTIALS

WORKDIR /serverless

ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV NODE_ENV=production

# Install dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY .npmrc .
COPY tools/plugins tools/plugins
COPY patches patches
RUN git config --global url."$GIT_CREDENTIALS/".insteadOf ssh://git@github.com/
COPY @types ./@types
RUN npm ci --production --quiet

# Copy built bundles
#   server
COPY dist/apps/seo-submodule/seo-payload dist/apps/seo-submodule/seo-payload
#   admin panel
COPY build build

EXPOSE 3333

CMD [ "node", "dist/apps/seo-submodule/seo-payload/main.js"]
