export CGO_ENABLED=0
export GOOS=linux
export GOARCH=amd64
export GOAMD64=v3  
export GOMAXPROCS=$(nproc)

OUTPUT_DIR="/root/badping/ingame/client"
mkdir -p "$OUTPUT_DIR"

go build -p "$(nproc)" \
  -trimpath \
  -ldflags "-s -w -extldflags '-static' -buildid= -X main.version=$(git describe --tags --always) -X main.commit=$(git rev-parse HEAD)" \
  -o "$OUTPUT_DIR/FP_AMD64_BUILD_oXF001"
