FROM public.ecr.aws/docker/library/node:18.13.0-buster as builder

# Used for install jerry private repo dependencies
ARG GIT_CREDENTIALS

WORKDIR /serverless

ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

# Install dependencies
RUN npm install -g clean-modules
RUN git config --global url."$GIT_CREDENTIALS/".insteadOf ssh://git@github.com/

# Build app dependencies
COPY dist/apps/<%= name %>/package.json dist/apps/<%= name %>/package.json
COPY dist/apps/<%= name %>/patches dist/apps/<%= name %>/patches

WORKDIR /serverless/dist/apps/<%= name %>

RUN npm i --force --quiet --no-audit --legacy-peer-deps
RUN clean-modules "**/*.d.ts" "**/@types/**" "!makefile.js" -y

# Build app
COPY dist/apps/<%= name %>/ /serverless/dist/apps/<%= name %>/

# production stage
FROM public.ecr.aws/docker/library/node:18.13.0-bullseye-slim

WORKDIR /serverless

COPY --from=builder /serverless .

EXPOSE <%= healthCheckPort %>

CMD [ "node", "dist/apps/<%= name %>/main.js" ]
