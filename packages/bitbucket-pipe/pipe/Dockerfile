FROM node:20-alpine

LABEL maintainer="Ikko Ashimine <eltociear@gmail.com>"
LABEL description="PoHI Human Approval Pipe for Bitbucket Pipelines"
LABEL version="0.3.0"
LABEL org.opencontainers.image.source="https://github.com/pohi-protocol/pohi"

WORKDIR /app

# Copy the bundled script
COPY dist/index.js ./

# Make it executable
RUN chmod +x index.js

# Run the approval script
ENTRYPOINT ["node", "index.js"]
