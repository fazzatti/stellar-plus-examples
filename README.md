# Stellar-Plus Examples

This project contains a collection of use cases of the Stellar network using the `stellar-plus` library, built with Node.js and TypeScript.

## Prerequisites

- Node.js (recommended version 18.x or higher)
- pnpm

## Installation

Clone the repository and install the dependencies:

```bash
pnpm install
```

## Configuration

Create a `.env` file in the root directory or copy the `.env.example`and add the necessary parameters.

## Usage

To run the project, use the following command:

```
pnpm run dev
```

In the entry file `src/index.ts`, you can select which example to execute by modifying the `examples` object usage.

## Examples

The project includes several examples demonstrating different aspects of interacting with the Stellar network:

- `account`: Basic account operations
- `classicAsset`: Handling of traditional Stellar assets
- `plugins`: Demonstrating usage of various pipeline plugins
- `soroban`: Examples using Soroban, Stellar's smart contract platform
- `RPC`: Remote procedure calls on Stellar
- `errorHandling`: Proper error management in Stellar applications

Feel free to modify and run different examples as per your needs.

## Documentation

For detailed documentation of the `stellar-plus` library, visit [Stellar-Plus Documentation](https://docs.cheesecakelabs.com/stellar-plus).

The source code is available at [GitHub - stellar-plus](https://github.com/CheesecakeLabs/stellar-plus/).

Refer to thhe following video on how to take the first steps with Stellar Plus:
[![Watch the video](https://img.youtube.com/vi/nKtsSbTwMI8/hqdefault.jpg)](https://www.youtube.com/watch?v=nKtsSbTwMI8)

## Support

For support, open an issue on the GitHub repository or reach out via the project's community channels.

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
