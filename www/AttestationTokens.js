/* global cordova */

const timeToCacheAttestationResult = 60 * 1000;

class AttestationTokens {
  constructor() {
    this.debugOn = false;

    this.execNative = (name, options) => {
      return new Promise((resolve, reject) => {
        this.debugOn && console.log(`Running native AttestationTokens.${name}`);
        cordova.exec(
          (result) => {
            this.debugOn &&
              console.log(`Finished native AttestationTokens.${name}: success`);
            resolve(result);
          },
          (errorInfo) => {
            if (errorInfo instanceof Error) {
              this.debugOn &&
                console.log(
                  `Finished native AttestationTokens.${name}: error(${errorInfo})`,
                );
              reject(errorInfo);
            } else if (errorInfo && typeof errorInfo === 'string') {
              this.debugOn &&
                console.log(
                  `Finished native AttestationTokens.${name}: error(${errorInfo})`,
                );
              reject(new Error(errorInfo));
            }

            let error = new Error();
            if (typeof errorInfo === 'object') {
              error = Object.assign(error, errorInfo);
            }
            this.debugOn &&
              console.log(
                `Finished native AttestationTokens.${name}: error(${error})`,
              );
            reject(error);
          },
          'AttestationTokens',
          name,
          [options],
        );
      });
    };
  }

  /** @param {boolean} enable */
  debug(enable) {
    this.debugOn = !!enable;
  }

  /**
   * @returns {Promise<string>}
   */
  async getToken() {
    if (this.newTokenPromise) {
      return await this.newTokenPromise;
    }

    if (
      this.lastTokenTimestamp &&
      Date.now() - this.lastTokenTimestamp < timeToCacheAttestationResult
    ) {
      if (this.lastTokenError) {
        throw this.lastTokenError;
      }
      return this.lastToken;
    }

    try {
      this.newTokenPromise = this.execNative('getToken');
      const token = await this.newTokenPromise;
      this.newTokenPromise = null;
      this.lastToken = token;
      this.lastTokenError = null;
      this.lastTokenTimestamp = Date.now();
      return token;
    } catch (error) {
      this.newTokenPromise = null;
      this.lastToken = null;
      this.lastTokenError = error;
      this.lastTokenTimestamp = Date.now();
      throw error;
    }
  }

  /**
   * @returns {Promise<string>}
   */
  async getLimitedUseToken() {
    return await this.execNative('getLimitedUseToken');
  }
}

module.exports = new AttestationTokens();
