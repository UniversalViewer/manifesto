import {
  ExternalResourceType,
  ViewingHint
} from "@iiif/vocabulary/dist-commonjs";
import {
  Annotation,
  AnnotationList,
  AnnotationPage,
  IExternalImageResourceData,
  IManifestoOptions,
  Range,
  Resource,
  Service,
  Size,
  Utils
} from "./internal";
import flatten from "lodash/flatten";
import flattenDeep from "lodash/flattenDeep";

export class Canvas extends Resource {
  public ranges: Range[];

  constructor(jsonld?: any, options?: IManifestoOptions) {
    super(jsonld, options);
  }

  // http://iiif.io/api/image/2.1/#canonical-uri-syntax
  getCanonicalImageUri(w?: number): string {
    let id: string | null = null;
    const region: string = "full";
    const rotation: number = 0;
    let quality: string = "default";
    let width: number | undefined = w;
    let size: string;

    // if an info.json has been loaded
    if (
      this.externalResource &&
      this.externalResource.data &&
      this.externalResource.data["@id"]
    ) {
      id = this.externalResource.data["@id"];

      if (!width) {
        width = (<IExternalImageResourceData>this.externalResource.data).width;
      }

      if (this.externalResource.data["@context"]) {
        if (
          this.externalResource.data["@context"].indexOf("/1.0/context.json") >
            -1 ||
          this.externalResource.data["@context"].indexOf("/1.1/context.json") >
            -1 ||
          this.externalResource.data["@context"].indexOf("/1/context.json") > -1
        ) {
          quality = "native";
        }
      }
    } else {
      // info.json hasn't been loaded yet
      const images: Annotation[] = this.getImages();

      if (images && images.length) {
        const firstImage: Annotation = images[0];
        const resource: Resource = firstImage.getResource();
        const services: Service[] = resource.getServices();

        if (!width) {
          width = resource.getWidth();
        }

        if (services.length) {
          const service: Service = services[0];
          id = service.id;
          quality = Utils.getImageQuality(service.getProfile());
        } else if (width === resource.getWidth()) {
          // if the passed width is the same as the resource width
          // i.e. not looking for a thumbnail
          // return the full size image.
          // used for download options when loading static images.
          return resource.id;
        }
      }

      // todo: should this be moved to getThumbUri?
      if (!id) {
        const thumbnail: any = this.getProperty("thumbnail");

        if (thumbnail) {
          if (typeof thumbnail === "string") {
            return thumbnail;
          } else {
            if (thumbnail["@id"]) {
              return thumbnail["@id"];
            } else if (thumbnail.length) {
              return thumbnail[0].id;
            }
          }
        }
      }
    }

    size = width + ",";

    // trim off trailing '/'
    if (id && id.endsWith("/")) {
      id = id.substr(0, id.length - 1);
    }

    const uri: string = [id, region, size, rotation, quality + ".jpg"].join(
      "/"
    );

    return uri;
  }

  getMaxDimensions(): Size | null {
    let maxDimensions: Size | null = null;
    let profile: any;

    if (
      this.externalResource &&
      this.externalResource.data &&
      this.externalResource.data.profile
    ) {
      profile = this.externalResource.data.profile;

      if (Array.isArray(profile)) {
        profile = profile.filter(p => p["maxWidth" || "maxwidth"])[0];

        if (profile) {
          maxDimensions = new Size(
            profile.maxWidth,
            profile.maxHeight ? profile.maxHeight : profile.maxWidth
          );
        }
      }
    }

    return maxDimensions;
  }

  /**
   * Return first annotation page of content.
   */
  getContent(): Annotation[];

  /**
   * Get content by index of annotation page
   * @param index
   */
  getContent(index: number): Annotation[];

  /**
   * Get canvas content by Identifier on Annotation Page
   * @param pageId
   */
  getContent(pageId: string): Annotation[];
  getContent(index: string | number = 0): Annotation[] {
    const content: Annotation[] = [];

    const items = this.__jsonld.items || this.__jsonld.content;

    if (!items) return content;

    // should be contained in an AnnotationPage
    let annotationPage: AnnotationPage | null = null;

    const page =
      typeof index === "string"
        ? this.getAnnotationPageIndexById(index, 0)
        : index;

    if (items.length) {
      annotationPage = new AnnotationPage(items[page], this.options);
    }

    if (!annotationPage) {
      return content;
    }

    const annotations: Annotation[] = annotationPage.getItems();

    for (let i = 0; i < annotations.length; i++) {
      const a = annotations[i];
      const annotation = new Annotation(a, this.options);
      content.push(annotation);
    }

    return content;
  }

  /**
   * Returns the index of the annotation page given an ID.
   *
   * @param pageId
   */
  getAnnotationPageIndexById(pageId: string): number | undefined;
  getAnnotationPageIndexById(pageId: string, defaultIndex: number): number;
  getAnnotationPageIndexById(
    pageId: string,
    defaultIndex?: number
  ): number | undefined {
    const items = this.__jsonld.items || this.__jsonld.content;
    if (!items || items.length === 0) {
      return defaultIndex;
    }

    for (let index = 0; index < items.length; index++) {
      if (items[index].id && items[index].id === pageId) {
        return index;
      }
    }

    return defaultIndex;
  }

  getAnnotationTotalPages(): number {
    return (this.__jsonld.items || this.__jsonld.content || []).length;
  }

  getDuration(): number | null {
    return this.getProperty("duration");
  }

  getImages(): Annotation[] {
    const images: Annotation[] = [];

    if (!this.__jsonld.images) return images;

    for (let i = 0; i < this.__jsonld.images.length; i++) {
      const a = this.__jsonld.images[i];
      const annotation = new Annotation(a, this.options);
      images.push(annotation);
    }

    return images;
  }

  getIndex(): number {
    return this.getProperty("index");
  }

  getOtherContent(): Promise<AnnotationList[]> {
    const otherContent = Array.isArray(this.getProperty("otherContent"))
      ? this.getProperty("otherContent")
      : [this.getProperty("otherContent")];

    const canonicalComparison = (typeA, typeB): boolean => {
      if (typeof typeA !== "string" || typeof typeB !== "string") {
        return false;
      }
      return typeA.toLowerCase() === typeA.toLowerCase();
    };

    const otherPromises: Promise<AnnotationList>[] = otherContent
      .filter(
        otherContent =>
          otherContent &&
          canonicalComparison(otherContent["@type"], "sc:AnnotationList")
      )
      .map(
        (annotationList, i) =>
          new AnnotationList(
            annotationList["label"] || `Annotation list ${i}`,
            annotationList,
            this.options
          )
      )
      .map(annotationList => annotationList.load());

    return Promise.all(otherPromises);
  }

  // Prefer thumbnail service to image service if supplied and if
  // the thumbnail service can provide a satisfactory size +/- x pixels.
  // this is used to get thumb URIs *before* the info.json has been requested
  // and populate thumbnails in a viewer.
  // the publisher may also provide pre-computed fixed-size thumbs for better performance.
  //getThumbUri(width: number): string {
  //
  //    var uri;
  //    var images: IAnnotation[] = this.getImages();
  //
  //    if (images && images.length) {
  //        var firstImage = images[0];
  //        var resource: IResource = firstImage.getResource();
  //        var services: IService[] = resource.getServices();
  //
  //        for (let i = 0; i < services.length; i++) {
  //            var service: IService = services[i];
  //            var id = service.id;
  //
  //            if (!_endsWith(id, '/')) {
  //                id += '/';
  //            }
  //
  //            uri = id + 'full/' + width + ',/0/' + Utils.getImageQuality(service.getProfile()) + '.jpg';
  //        }
  //    }
  //
  //    return uri;
  //}

  //getType(): CanvasType {
  //    return new CanvasType(this.getProperty('@type').toLowerCase());
  //}

  getWidth(): number {
    return this.getProperty("width");
  }

  getHeight(): number {
    return this.getProperty("height");
  }

  getViewingHint(): ViewingHint | null {
    return this.getProperty("viewingHint");
  }

  get imageResources() {
    const resources = flattenDeep([
      this.getImages().map(i => i.getResource()),
      this.getContent().map(i => i.getBody())
    ]);

    return flatten(
      resources.map(resource => {
        switch (resource.getProperty("type").toLowerCase()) {
          case ExternalResourceType.CHOICE:
          case ExternalResourceType.OA_CHOICE:
            return new Canvas(
              {
                images: flatten([
                  resource.getProperty("default"),
                  resource.getProperty("item")
                ]).map(r => ({ resource: r }))
              },
              this.options
            )
              .getImages()
              .map(i => i.getResource());
          default:
            return resource;
        }
      })
    );
  }

  get resourceAnnotations() {
    return flattenDeep([this.getImages(), this.getContent()]);
  }

  /**
   * Returns a given resource Annotation, based on a contained resource or body
   * id
   */
  resourceAnnotation(id) {
    return this.resourceAnnotations.find(
      anno =>
        anno.getResource().id === id ||
        flatten(new Array(anno.getBody())).some(body => body.id === id)
    );
  }

  /**
   * Returns the fragment placement values if a resourceAnnotation is placed on
   * a canvas somewhere besides the full extent
   */
  onFragment(id) {
    const resourceAnnotation = this.resourceAnnotation(id);
    if (!resourceAnnotation) return undefined;
    // IIIF v2
    const on = resourceAnnotation.getProperty("on");
    // IIIF v3
    const target = resourceAnnotation.getProperty("target");
    const fragmentMatch = (on || target).match(/xywh=(.*)$/);
    if (!fragmentMatch) return undefined;
    return fragmentMatch[1].split(",").map(str => parseInt(str, 10));
  }

  get iiifImageResources() {
    return this.imageResources.filter(
      r => r && r.getServices()[0] && r.getServices()[0].id
    );
  }

  get imageServiceIds() {
    return this.iiifImageResources.map(r => r.getServices()[0].id);
  }

  get aspectRatio() {
    return this.getWidth() / this.getHeight();
  }
}
