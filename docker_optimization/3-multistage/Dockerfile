FROM golang:1.22 AS builder

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server .

FROM alpine:3.20
COPY --from=builder /app/server /server
CMD ["/server"]
