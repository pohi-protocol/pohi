FROM node:20-alpine

LABEL maintainer="Ikko Ashimine <eltociear@gmail.com>"
LABEL description="PoHI Human Approval Pipe for Bitbucket Pipelines"
LABEL version="0.1.0"

WORKDIR /app

# Copy the bundled script
COPY dist/index.js ./

# Make it executable
RUN chmod +x index.js

# Run the approval script
ENTRYPOINT ["node", "index.js"]
