import {
  Deserialiser,
  IAccessToken,
  IExternalResource,
  IIIFResource,
  IManifestoOptions,
  JSONLDResource,
  Service,
  StatusCode,
  TreeNode
} from "./internal";
import { MediaType, ServiceProfile } from "@iiif/vocabulary/dist-commonjs";
import {
  OK,
  MOVED_TEMPORARILY,
  UNAUTHORIZED
} from "@edsilv/http-status-codes/dist-commonjs";
import "isomorphic-unfetch";

export class Utils {
  static getMediaType(type: string): MediaType {
    type = type.toLowerCase();
    type = type.split(";")[0];
    return <MediaType>type.trim();
  }

  static getImageQuality(profile: ServiceProfile): string {
    if (
      profile === ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_2 ||
      profile === ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_2 ||
      profile === ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_2 ||
      profile === ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_2 ||
      profile === ServiceProfile.IMAGE_1_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_1_PROFILE_LEVEL_1 ||
      profile === ServiceProfile.IMAGE_1_LEVEL_2 ||
      profile === ServiceProfile.IMAGE_1_PROFILE_LEVEL_2
    ) {
      return "native";
    }

    return "default";
  }

  static getInexactLocale(locale: string): string {
    if (locale.indexOf("-") !== -1) {
      return locale.substr(0, locale.indexOf("-"));
    }

    return locale;
  }

  static getLocalisedValue(resource: any, locale: string): string | null {
    // if the resource is not an array of translations, return the string.
    if (!Array.isArray(resource)) {
      return resource;
    }

    // test for exact match
    for (let i = 0; i < resource.length; i++) {
      const value = resource[i];
      const language = value["@language"];

      if (locale === language) {
        return <string>value["@value"];
      }
    }

    // test for inexact match
    const match: string = locale.substr(0, locale.indexOf("-"));

    for (let i = 0; i < resource.length; i++) {
      var value = resource[i];
      var language = value["@language"];

      if (language === match) {
        return <string>value["@value"];
      }
    }

    return null;
  }

  static generateTreeNodeIds(treeNode: TreeNode, index: number = 0): void {
    let id: string;

    if (!treeNode.parentNode) {
      id = "0";
    } else {
      id = treeNode.parentNode.id + "-" + index;
    }

    treeNode.id = id;

    for (let i = 0; i < treeNode.nodes.length; i++) {
      var n: TreeNode = treeNode.nodes[i];
      Utils.generateTreeNodeIds(n, i);
    }
  }

  static normaliseType(type: string): string {
    type = (type || "").toLowerCase();

    if (type.indexOf(":") !== -1) {
      const split: string[] = type.split(":");
      return split[1];
    }

    return type;
  }

  static normaliseUrl(url: string): string {
    url = url.substr(url.indexOf("://"));

    if (url.indexOf("#") !== -1) {
      url = url.split("#")[0];
    }

    return url;
  }

  static normalisedUrlsMatch(url1: string, url2: string): boolean {
    return Utils.normaliseUrl(url1) === Utils.normaliseUrl(url2);
  }

  static isImageProfile(profile: ServiceProfile): boolean {
    if (
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_0) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_1) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_2) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_0) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_2_PROFILE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_1) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_2_PROFILE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_2) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_PROFILE_LEVEL_2)
    ) {
      return true;
    }

    return false;
  }

  static isLevel0ImageProfile(profile: ServiceProfile): boolean {
    if (
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_0) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_0
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_0) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_PROFILE_LEVEL_0)
    ) {
      return true;
    }

    return false;
  }

  static isLevel1ImageProfile(profile: ServiceProfile): boolean {
    if (
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_1) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_1
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_1) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_PROFILE_LEVEL_1)
    ) {
      return true;
    }

    return false;
  }

  static isLevel2ImageProfile(profile: ServiceProfile): boolean {
    if (
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_COMPLIANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_COMPLIANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_0_CONFORMANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_CONFORMANCE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_1_LEVEL_2) ||
      Utils.normalisedUrlsMatch(
        profile,
        ServiceProfile.IMAGE_1_PROFILE_LEVEL_2
      ) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_LEVEL_2) ||
      Utils.normalisedUrlsMatch(profile, ServiceProfile.IMAGE_2_PROFILE_LEVEL_2)
    ) {
      return true;
    }

    return false;
  }

  static parseManifest(
    manifest: any,
    options?: IManifestoOptions | undefined
  ): IIIFResource | null {
    return Deserialiser.parse(manifest, options);
  }

  static checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      var error = new Error(response.statusText);
      (error as any).response = response;
      return Promise.reject(error);
    }
  }

  static loadManifest(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      fetch(url)
        .then(Utils.checkStatus)
        .then(r => r.json())
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject();
        });
    });
  }

  static loadExternalResourcesAuth1(
    resources: IExternalResource[],
    openContentProviderInteraction: (service: Service) => any,
    openTokenService: (
      resource: IExternalResource,
      tokenService: Service
    ) => Promise<any>,
    getStoredAccessToken: (
      resource: IExternalResource
    ) => Promise<IAccessToken | null>,
    userInteractedWithContentProvider: (
      contentProviderInteraction: any
    ) => Promise<any>,
    getContentProviderInteraction: (
      resource: IExternalResource,
      service: Service
    ) => Promise<any>,
    handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
    showOutOfOptionsMessages: (
      resource: IExternalResource,
      service: Service
    ) => void
  ): Promise<IExternalResource[]> {
    return new Promise<IExternalResource[]>((resolve, reject) => {
      const promises = resources.map((resource: IExternalResource) => {
        return Utils.loadExternalResourceAuth1(
          resource,
          openContentProviderInteraction,
          openTokenService,
          getStoredAccessToken,
          userInteractedWithContentProvider,
          getContentProviderInteraction,
          handleMovedTemporarily,
          showOutOfOptionsMessages
        );
      });

      Promise.all(promises)
        .then(() => {
          resolve(resources);
        })
        ["catch"](error => {
          reject(error);
        });
    });
  }

  static async loadExternalResourceAuth1(
    resource: IExternalResource,
    openContentProviderInteraction: (service: Service) => any,
    openTokenService: (
      resource: IExternalResource,
      tokenService: Service
    ) => Promise<void>,
    getStoredAccessToken: (
      resource: IExternalResource
    ) => Promise<IAccessToken | null>,
    userInteractedWithContentProvider: (
      contentProviderInteraction: any
    ) => Promise<any>,
    getContentProviderInteraction: (
      resource: IExternalResource,
      service: Service
    ) => Promise<any>,
    handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
    showOutOfOptionsMessages: (
      resource: IExternalResource,
      service: Service
    ) => void
  ): Promise<IExternalResource> {
    const storedAccessToken: IAccessToken | null = await getStoredAccessToken(
      resource
    );

    if (storedAccessToken) {
      await resource.getData(storedAccessToken);

      if (resource.status === OK) {
        return resource;
      } else {
        // the stored token is no good for this resource
        await Utils.doAuthChain(
          resource,
          openContentProviderInteraction,
          openTokenService,
          userInteractedWithContentProvider,
          getContentProviderInteraction,
          handleMovedTemporarily,
          showOutOfOptionsMessages
        );
      }

      if (resource.status === OK || resource.status === MOVED_TEMPORARILY) {
        return resource;
      }

      throw Utils.createAuthorizationFailedError();
    } else {
      await resource.getData();

      if (
        resource.status === MOVED_TEMPORARILY ||
        resource.status === UNAUTHORIZED
      ) {
        await Utils.doAuthChain(
          resource,
          openContentProviderInteraction,
          openTokenService,
          userInteractedWithContentProvider,
          getContentProviderInteraction,
          handleMovedTemporarily,
          showOutOfOptionsMessages
        );
      }

      if (resource.status === OK || resource.status === MOVED_TEMPORARILY) {
        return resource;
      }

      throw Utils.createAuthorizationFailedError();
    }
  }

  static async doAuthChain(
    resource: IExternalResource,
    openContentProviderInteraction: (service: Service) => any,
    openTokenService: (
      resource: IExternalResource,
      tokenService: Service
    ) => Promise<any>,
    userInteractedWithContentProvider: (
      contentProviderInteraction: any
    ) => Promise<any>,
    getContentProviderInteraction: (
      resource: IExternalResource,
      service: Service
    ) => Promise<any>,
    handleMovedTemporarily: (resource: IExternalResource) => Promise<any>,
    showOutOfOptionsMessages: (
      resource: IExternalResource,
      service: Service
    ) => void
  ): Promise<IExternalResource | void> {
    // This function enters the flowchart at the < External? > junction
    // http://iiif.io/api/auth/1.0/#workflow-from-the-browser-client-perspective
    if (!resource.isAccessControlled()) {
      return resource; // no services found
    }

    // add options to all services.
    const externalService: Service | null = resource.externalService;

    if (externalService) {
      externalService.options = <IManifestoOptions>resource.options;
    }

    const kioskService: Service | null = resource.kioskService;

    if (kioskService) {
      kioskService.options = <IManifestoOptions>resource.options;
    }

    const clickThroughService: Service | null = resource.clickThroughService;

    if (clickThroughService) {
      clickThroughService.options = <IManifestoOptions>resource.options;
    }

    const loginService: Service | null = resource.loginService;

    if (loginService) {
      loginService.options = <IManifestoOptions>resource.options;
    }

    if (!resource.isResponseHandled && resource.status === MOVED_TEMPORARILY) {
      await handleMovedTemporarily(resource);
      return resource;
    }

    let serviceToTry: Service | null = null;
    let lastAttempted: Service | null = null;

    // repetition of logic is left in these steps for clarity:

    // Looking for external pattern
    serviceToTry = externalService;

    if (serviceToTry) {
      lastAttempted = serviceToTry;
      await Utils.attemptResourceWithToken(
        resource,
        openTokenService,
        serviceToTry
      );
      return resource;
    }

    // Looking for kiosk pattern
    serviceToTry = kioskService;

    if (serviceToTry) {
      lastAttempted = serviceToTry;
      let kioskInteraction = openContentProviderInteraction(serviceToTry);
      if (kioskInteraction) {
        await userInteractedWithContentProvider(kioskInteraction);
        await Utils.attemptResourceWithToken(
          resource,
          openTokenService,
          serviceToTry
        );
        return resource;
      }
    }

    // The code for the next two patterns is identical (other than the profile name).
    // The difference is in the expected behaviour of
    //
    //    await userInteractedWithContentProvider(contentProviderInteraction);
    //
    // For clickthrough the opened window should close immediately having established
    // a session, whereas for login the user might spend some time entering credentials etc.

    // Looking for clickthrough pattern
    serviceToTry = clickThroughService;

    if (serviceToTry) {
      lastAttempted = serviceToTry;
      let contentProviderInteraction = await getContentProviderInteraction(
        resource,
        serviceToTry
      );
      if (contentProviderInteraction) {
        // should close immediately
        await userInteractedWithContentProvider(contentProviderInteraction);
        await Utils.attemptResourceWithToken(
          resource,
          openTokenService,
          serviceToTry
        );
        return resource;
      }
    }

    // Looking for login pattern
    serviceToTry = loginService;

    if (serviceToTry) {
      lastAttempted = serviceToTry;
      let contentProviderInteraction = await getContentProviderInteraction(
        resource,
        serviceToTry
      );
      if (contentProviderInteraction) {
        // we expect the user to spend some time interacting
        await userInteractedWithContentProvider(contentProviderInteraction);
        await Utils.attemptResourceWithToken(
          resource,
          openTokenService,
          serviceToTry
        );
        return resource;
      }
    }

    // nothing worked! Use the most recently tried service as the source of
    // messages to show to the user.
    if (lastAttempted) {
      showOutOfOptionsMessages(resource, lastAttempted);
    }
  }

  static async attemptResourceWithToken(
    resource: IExternalResource,
    openTokenService: (
      resource: IExternalResource,
      tokenService: Service
    ) => Promise<any>,
    authService: Service
  ): Promise<IExternalResource | void> {
    // attempting token interaction for " + authService["@id"]
    const tokenService: Service | null = authService.getService(
      ServiceProfile.AUTH_1_TOKEN
    );

    if (tokenService) {
      // found token service: " + tokenService["@id"]);
      let tokenMessage: any = await openTokenService(resource, tokenService);

      if (tokenMessage && tokenMessage.accessToken) {
        await resource.getData(tokenMessage);
        return resource;
      }
    }
  }

  static loadExternalResourcesAuth09(
    resources: IExternalResource[],
    tokenStorageStrategy: string,
    clickThrough: (resource: IExternalResource) => Promise<any>,
    restricted: (resource: IExternalResource) => Promise<any>,
    login: (resource: IExternalResource) => Promise<any>,
    getAccessToken: (
      resource: IExternalResource,
      rejectOnError: boolean
    ) => Promise<IAccessToken>,
    storeAccessToken: (
      resource: IExternalResource,
      token: IAccessToken,
      tokenStorageStrategy: string
    ) => Promise<any>,
    getStoredAccessToken: (
      resource: IExternalResource,
      tokenStorageStrategy: string
    ) => Promise<IAccessToken>,
    handleResourceResponse: (resource: IExternalResource) => Promise<any>,
    options?: IManifestoOptions
  ): Promise<IExternalResource[]> {
    return new Promise<IExternalResource[]>((resolve, reject) => {
      const promises = resources.map((resource: IExternalResource) => {
        return Utils.loadExternalResourceAuth09(
          resource,
          tokenStorageStrategy,
          clickThrough,
          restricted,
          login,
          getAccessToken,
          storeAccessToken,
          getStoredAccessToken,
          handleResourceResponse,
          options
        );
      });

      Promise.all(promises)
        .then(() => {
          resolve(resources);
        })
        ["catch"](error => {
          reject(error);
        });
    });
  }

  // IIIF auth api pre v1.0
  // Keeping this around for now until the auth 1.0 implementation is stable
  static loadExternalResourceAuth09(
    resource: IExternalResource,
    tokenStorageStrategy: string,
    clickThrough: (resource: IExternalResource) => Promise<any>,
    restricted: (resource: IExternalResource) => Promise<any>,
    login: (resource: IExternalResource) => Promise<any>,
    getAccessToken: (
      resource: IExternalResource,
      rejectOnError: boolean
    ) => Promise<IAccessToken>,
    storeAccessToken: (
      resource: IExternalResource,
      token: IAccessToken,
      tokenStorageStrategy: string
    ) => Promise<any>,
    getStoredAccessToken: (
      resource: IExternalResource,
      tokenStorageStrategy: string
    ) => Promise<IAccessToken>,
    handleResourceResponse: (resource: IExternalResource) => Promise<any>,
    options?: IManifestoOptions
  ): Promise<IExternalResource> {
    return new Promise<any>((resolve, reject) => {
      if (options && options.pessimisticAccessControl) {
        // pessimistic: access control cookies may have been deleted.
        // always request the access token for every access controlled info.json request
        // returned access tokens are not stored, therefore the login window flashes for every request.

        resource
          .getData()
          .then(() => {
            if (resource.isAccessControlled()) {
              // if the resource has a click through service, use that.
              if (resource.clickThroughService) {
                resolve(clickThrough(resource));
                //} else if(resource.restrictedService) {
                resolve(restricted(resource));
              } else {
                login(resource)
                  .then(() => {
                    getAccessToken(resource, true)
                      .then((token: IAccessToken) => {
                        resource
                          .getData(token)
                          .then(() => {
                            resolve(handleResourceResponse(resource));
                          })
                          ["catch"](message => {
                            reject(Utils.createInternalServerError(message));
                          });
                      })
                      ["catch"](message => {
                        reject(Utils.createInternalServerError(message));
                      });
                  })
                  ["catch"](message => {
                    reject(Utils.createInternalServerError(message));
                  });
              }
            } else {
              // this info.json isn't access controlled, therefore no need to request an access token.
              resolve(resource);
            }
          })
          ["catch"](message => {
            reject(Utils.createInternalServerError(message));
          });
      } else {
        // optimistic: access control cookies may not have been deleted.
        // store access tokens to avoid login window flashes.
        // if cookies are deleted a page refresh is required.

        // try loading the resource using an access token that matches the info.json domain.
        // if an access token is found, request the resource using it regardless of whether it is access controlled.
        getStoredAccessToken(resource, tokenStorageStrategy)
          .then((storedAccessToken: IAccessToken) => {
            if (storedAccessToken) {
              // try using the stored access token
              resource
                .getData(storedAccessToken)
                .then(() => {
                  // if the info.json loaded using the stored access token
                  if (resource.status === OK) {
                    resolve(handleResourceResponse(resource));
                  } else {
                    // otherwise, load the resource data to determine the correct access control services.
                    // if access controlled, do login.
                    Utils.authorize(
                      resource,
                      tokenStorageStrategy,
                      clickThrough,
                      restricted,
                      login,
                      getAccessToken,
                      storeAccessToken,
                      getStoredAccessToken
                    )
                      .then(() => {
                        resolve(handleResourceResponse(resource));
                      })
                      ["catch"](error => {
                        // if (resource.restrictedService){
                        //     reject(Utils.createRestrictedError());
                        // } else {
                        reject(Utils.createAuthorizationFailedError());
                        //}
                      });
                  }
                })
                ["catch"](error => {
                  reject(Utils.createAuthorizationFailedError());
                });
            } else {
              Utils.authorize(
                resource,
                tokenStorageStrategy,
                clickThrough,
                restricted,
                login,
                getAccessToken,
                storeAccessToken,
                getStoredAccessToken
              )
                .then(() => {
                  resolve(handleResourceResponse(resource));
                })
                ["catch"](error => {
                  reject(Utils.createAuthorizationFailedError());
                });
            }
          })
          ["catch"](error => {
            reject(Utils.createAuthorizationFailedError());
          });
      }
    });
  }

  static createError(name: StatusCode, message: string): Error {
    const error: Error = new Error();
    error.message = message;
    error.name = String(name);
    return error;
  }

  static createAuthorizationFailedError(): Error {
    return Utils.createError(
      StatusCode.AUTHORIZATION_FAILED,
      "Authorization failed"
    );
  }

  static createRestrictedError(): Error {
    return Utils.createError(StatusCode.RESTRICTED, "Restricted");
  }

  static createInternalServerError(message: string): Error {
    return Utils.createError(StatusCode.INTERNAL_SERVER_ERROR, message);
  }

  static authorize(
    resource: IExternalResource,
    tokenStorageStrategy: string,
    clickThrough: (resource: IExternalResource) => Promise<any>,
    restricted: (resource: IExternalResource) => Promise<any>,
    login: (resource: IExternalResource) => Promise<any>,
    getAccessToken: (
      resource: IExternalResource,
      rejectOnError: boolean
    ) => Promise<IAccessToken>,
    storeAccessToken: (
      resource: IExternalResource,
      token: IAccessToken,
      tokenStorageStrategy: string
    ) => Promise<any>,
    getStoredAccessToken: (
      resource: IExternalResource,
      tokenStorageStrategy: string
    ) => Promise<IAccessToken>
  ): Promise<IExternalResource> {
    return new Promise<IExternalResource>((resolve, reject) => {
      resource.getData().then(() => {
        if (resource.isAccessControlled()) {
          getStoredAccessToken(resource, tokenStorageStrategy)
            .then((storedAccessToken: IAccessToken) => {
              if (storedAccessToken) {
                // try using the stored access token
                resource
                  .getData(storedAccessToken)
                  .then(() => {
                    if (resource.status === OK) {
                      resolve(resource); // happy path ended
                    } else {
                      // the stored token is no good for this resource
                      Utils.showAuthInteraction(
                        resource,
                        tokenStorageStrategy,
                        clickThrough,
                        restricted,
                        login,
                        getAccessToken,
                        storeAccessToken,
                        resolve,
                        reject
                      );
                    }
                  })
                  ["catch"](message => {
                    reject(Utils.createInternalServerError(message));
                  });
              } else {
                // There was no stored token, but the user might have a cookie that will grant a token
                getAccessToken(resource, false).then(accessToken => {
                  if (accessToken) {
                    storeAccessToken(
                      resource,
                      accessToken,
                      tokenStorageStrategy
                    )
                      .then(() => {
                        // try using the fresh access token
                        resource
                          .getData(accessToken)
                          .then(() => {
                            if (resource.status === OK) {
                              resolve(resource);
                            } else {
                              // User has a token, but it's not good enough
                              Utils.showAuthInteraction(
                                resource,
                                tokenStorageStrategy,
                                clickThrough,
                                restricted,
                                login,
                                getAccessToken,
                                storeAccessToken,
                                resolve,
                                reject
                              );
                            }
                          })
                          ["catch"](message => {
                            reject(Utils.createInternalServerError(message));
                          });
                      })
                      ["catch"](message => {
                        // not able to store access token
                        reject(Utils.createInternalServerError(message));
                      });
                  } else {
                    // The user did not have a cookie that granted a token
                    Utils.showAuthInteraction(
                      resource,
                      tokenStorageStrategy,
                      clickThrough,
                      restricted,
                      login,
                      getAccessToken,
                      storeAccessToken,
                      resolve,
                      reject
                    );
                  }
                });
              }
            })
            ["catch"](message => {
              reject(Utils.createInternalServerError(message));
            });
        } else {
          // this info.json isn't access controlled, therefore there's no need to request an access token
          resolve(resource);
        }
      });
    });
  }

  private static showAuthInteraction(
    resource: IExternalResource,
    tokenStorageStrategy: any,
    clickThrough: any,
    restricted: any,
    login: any,
    getAccessToken: any,
    storeAccessToken: any,
    resolve: any,
    reject: any
  ) {
    if (resource.status === MOVED_TEMPORARILY && !resource.isResponseHandled) {
      // if the resource was redirected to a degraded version
      // and the response hasn't been handled yet.
      // if the client wishes to trigger a login, set resource.isResponseHandled to true
      // and call loadExternalResources() again passing the resource.
      resolve(resource);
      // } else if (resource.restrictedService) {
      //     resolve(restricted(resource));
      //     // TODO: move to next etc
    } else if (resource.clickThroughService && !resource.isResponseHandled) {
      // if the resource has a click through service, use that.
      clickThrough(resource).then(() => {
        getAccessToken(resource, true)
          .then((accessToken: IAccessToken) => {
            storeAccessToken(resource, accessToken, tokenStorageStrategy)
              .then(() => {
                resource
                  .getData(accessToken)
                  .then(() => {
                    resolve(resource);
                  })
                  ["catch"](message => {
                    reject(Utils.createInternalServerError(message));
                  });
              })
              ["catch"]((message: string) => {
                reject(Utils.createInternalServerError(message));
              });
          })
          ["catch"]((message: string) => {
            reject(Utils.createInternalServerError(message));
          });
      });
    } else {
      // get an access token
      login(resource).then(() => {
        getAccessToken(resource, true)
          .then((accessToken: IAccessToken) => {
            storeAccessToken(resource, accessToken, tokenStorageStrategy)
              .then(() => {
                resource
                  .getData(accessToken)
                  .then(() => {
                    resolve(resource);
                  })
                  ["catch"](message => {
                    reject(Utils.createInternalServerError(message));
                  });
              })
              ["catch"]((message: string) => {
                reject(Utils.createInternalServerError(message));
              });
          })
          ["catch"]((message: string) => {
            reject(Utils.createInternalServerError(message));
          });
      });
    }
  }

  static getService(resource: any, profile: ServiceProfile): Service | null {
    const services: Service[] = this.getServices(resource);

    for (let i = 0; i < services.length; i++) {
      const service: Service = services[i];

      if (service.getProfile() === profile) {
        return service;
      }
    }

    return null;
  }

  static getResourceById(
    parentResource: JSONLDResource,
    id: string
  ): JSONLDResource {
    const presentation2Resource = Utils.traverseAndFind(
      parentResource.__jsonld,
      "@id",
      id
    );
    if (presentation2Resource) {
      return presentation2Resource as JSONLDResource;
    }

    return Utils.traverseAndFind(
      parentResource.__jsonld,
      "id",
      id
    ) as JSONLDResource;
  }

  /**
   * Does a depth first traversal of an Object, returning an Object that
   * matches provided k and v arguments
   * @example Utils.traverseAndFind({foo: 'bar'}, 'foo', 'bar')
   */

  static traverseAndFind(
    object: any,
    k: string,
    v: string
  ): object | undefined {
    if (object.hasOwnProperty(k) && object[k] === v) {
      return object;
    }

    for (var i = 0; i < Object.keys(object).length; i++) {
      if (typeof object[Object.keys(object)[i]] === "object") {
        var o = Utils.traverseAndFind(object[Object.keys(object)[i]], k, v);
        if (o != null) {
          return o;
        }
      }
    }

    return undefined;
  }

  static getServices(resource: any): Service[] {

    let service: any;

    // if passing a manifesto-parsed object, use the __jsonld.service property,
    // otherwise look for a service property (info.json services)
    if (resource.__jsonld) {
      service = resource.__jsonld.service;
    } else {
      service = (<any>resource).service;
    }

    const services: Service[] = [];

    // coerce to array
    if (!Array.isArray(service)) {
      service = [service];
    }

    if (resource.__jsonld && resource.__jsonld.services) {
      service.push(...resource.__jsonld.services);
    }

    if (service.length === 0) {
      return services;
    }

    for (let i = 0; i < service.length; i++) {
      const s: any = service[i];

      if (!s) {
        continue;
      }

      const id = typeof s === "string" ? s : s.id || s["@id"];

      if (id) {
        const r: JSONLDResource = this.getResourceById(
          resource.options.resource,
          id
        );

        if (r) {
          services.push(new Service(r.__jsonld || r, resource.options));
          continue;
        }
      }
      if (typeof s !== "string") {
        services.push(new Service(s, resource.options));
      }
    }

    return services;
  }

  static getTemporalComponent(target: string): number[] | null {
    const temporal: RegExpExecArray | null = /t=([^&]+)/g.exec(target);
    let t: number[] | null = null;

    if (temporal && temporal[1]) {
      t = <any>temporal[1].split(",");
    }

    return t;
  }
}
