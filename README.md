# File-Sys-Cache

File-Sys-Cache is an npm package that provides a simple and efficient system files-based caching solution for Node.js applications.

## Features

- **Set Cache**: Store data in the cache with options to specify file name prefix, file name, payload, and time-to-live (TTL).
- **Get Cached Data**: Retrieve cached data by providing the corresponding file name or prefix.
- **Invalidate Cached Data**: Automatically invalidate cached data for items with expired TTLs.
- **Flush Cache by Regex**: Flush cache entries that match a given regular expression.
- **Flush Whole Cache**: Clear the entire cache, removing all stored entries.
- **Storage Logs**: Monitor cache usage and performance statistics, including invalidated files count, logs over time, size over time, and request count.

## Installation

Install File-Sys-Cache via npm:

```bash
npm install @ndragun92/file-sys-cache
```

## Usage
```javascript
import { FileSysCache } from '@ndragun92/file-sys-cache'

// Create a new cache instance
const cache = new FileSysCache({
    basePath: './.file-sys-cache', // Directory where cache will be stored
    defaultTTL: 60, // 60 seconds expiration time
});

// Set cache with a file name prefix, file name, payload, and TTL
await cache.set({ fileNamePrefix: 'myPrefix', fileName: 'myFileName', payload: myPayload, ttl: 3600 })

// Retrieve cached data by file name prefix and file name
const data = await cache.get({fileNamePrefix: 'myPrefix', fileName: 'myFileName'});

// Invalidate expired cached data automatically

// Flush cache by passing regex
await cache.flushByRegex('myString'); // Flush cache by regex match

// Flush whole cache
await cache.flushAll();
```

For more detailed usage examples and API documentation, please refer to the [Documentation]() section.

## Contributing
Contributions are welcome! Please see the [Contributing Guidelines](https://github.com/ndragun92/file-sys-cache/blob/main/CONTRIBUTING.md) for more information.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/ndragun92/file-sys-cache/blob/main/LICENSE) file for details.