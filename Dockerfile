FROM rust:1-slim-buster AS build
WORKDIR /app
COPY src /app/src
COPY Cargo.toml /app/
COPY Cargo.lock /app/
RUN cargo build --release

FROM debian:buster-slim
COPY --from=build /app/target/release/autogit /app/autogit
RUN chmod +x /app/autogit
EXPOSE 8080
CMD "/app/autogit"