# Multi-stage ultra-lightweight container for GitHub App Token Broker
FROM golang:1.24-alpine AS builder

WORKDIR /build
COPY go.mod ./
COPY cmd/ ./cmd/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /build/token-broker ./cmd/broker/main.go

FROM scratch

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /build/token-broker /token-broker
COPY config/ /config/

EXPOSE 8080
ENTRYPOINT ["/token-broker"]
