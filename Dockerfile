FROM rust:1-slim-buster AS build
RUN cargo new --bin app
WORKDIR /app
COPY Cargo.toml /app/
COPY Cargo.lock /app/
RUN cargo build --release

FROM debian:buster-slim  
COPY --from=build /app/target/release/autogit /app/autogit  
CMD "/app/autogit"