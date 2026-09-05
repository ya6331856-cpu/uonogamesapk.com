const path = require("path");
require("dotenv").config();

const isDevServer = process.env.NODE_ENV !== "production";

const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

function makeDevServerV5Compatible(devServerConfig) {
  const {
    https,
    onAfterSetupMiddleware,
    onBeforeSetupMiddleware,
    onListening,
    setupMiddlewares,
    ...compatibleConfig
  } = devServerConfig;

  compatibleConfig.server =
    typeof https === "object"
      ? { type: "https", options: https }
      : https
      ? "https"
      : "http";

  compatibleConfig.headers = {
    ...compatibleConfig.headers,
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  if (onBeforeSetupMiddleware || setupMiddlewares) {
    compatibleConfig.setupMiddlewares = (middlewares, devServer) => {
      if (onBeforeSetupMiddleware) {
        onBeforeSetupMiddleware(devServer);
      }
      if (setupMiddlewares) {
        return setupMiddlewares(middlewares, devServer);
      }
      return middlewares;
    };
  }

  compatibleConfig.onListening = (devServer) => {
    devServer.close ??= (callback) => devServer.stopCallback(callback);
    if (onListening) {
      onListening(devServer);
    }
    if (onAfterSetupMiddleware) {
      onAfterSetupMiddleware(devServer);
    }
  };

  return compatibleConfig;
}

let webpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  webpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new webpackHealthPlugin();
}

let webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Native Webpack Aliases for bulletproof path resolution
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        "@": path.resolve(__dirname, "src"),
        "lib": path.resolve(__dirname, "src/lib"),
        "@lib": path.resolve(__dirname, "src/lib"),
        "components": path.resolve(__dirname, "src/components"),
        "context": path.resolve(__dirname, "src/context"),
      };

      // Add ignored patterns to reduce watched directories
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**",
        ],
      };

      // Bypass ModuleScopePlugin restrictions
      const scopePluginIndex = (webpackConfig.resolve.plugins || []).findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      if (scopePluginIndex > -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    if (config.enableHealthCheck && setupHealthEndpoints) {
      const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (originalSetupMiddlewares) {
          middlewares = originalSetupMiddlewares(middlewares, devServer);
        }
        setupHealthEndpoints(devServer, healthPluginInstance);
        return middlewares;
      };
    }
    return devServerConfig;
  },
};

// Wrap with visual edits (automatically adds babel plugin, dev server, and overlay in dev mode)

const configureDevServer = webpackConfig.devServer;
webpackConfig.devServer = configureDevServer
  ? (devServerConfig) => makeDevServerV5Compatible(configureDevServer(devServerConfig))
  : undefined;

module.exports = webpackConfig;
