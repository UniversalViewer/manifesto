var _assign = require("lodash.assign");
var _findIndex = require("lodash.findindex");

module Manifesto {
    export class IIIFResource extends ManifestResource implements IIIIFResource {
        public index: number = 0;
        public isLoaded: boolean = false;
        public parentCollection: ICollection;
        public parentLabel: string;
        public treeRoot: ITreeNode;

        constructor(jsonld: any, options?: IManifestoOptions) {
            super(jsonld, options);

            var defaultOptions: IManifestoOptions = {
                defaultLabel: '-',
                locale: 'en-GB',
                resource: <IIIIFResource>this,
                pessimisticAccessControl: false
            };

            this.options = _assign(defaultOptions, options);
        }

        generateTreeNodeIds(treeNode: ITreeNode, index: number = 0): void {

            var id: string;

            if (!treeNode.parentNode){
                id = '0';
            } else {
                id = treeNode.parentNode.id + "/" + index;
            }

            treeNode.id = id.hashCode();

            for (var i = 0; i < treeNode.nodes.length; i++){
                var n: ITreeNode = treeNode.nodes[i];
                this.generateTreeNodeIds(n, i);
            }
        }

        getAttribution(): string {
            return Utils.getLocalisedValue(this.getProperty('attribution'), this.options.locale);
        }

        getDescription(): string {
            return Utils.getLocalisedValue(this.getProperty('description'), this.options.locale);
        }

        getIIIFResourceType(): IIIFResourceType {
            return new IIIFResourceType(this.getProperty('@type'));
        }

        getLogo(): string {
            var logo = this.getProperty('logo');
            if (!logo) return null;
            if (_isString(logo)) return logo;
            return logo['@id'];
        }

        getLicense(): string {
            return Utils.getLocalisedValue(this.getProperty('license'), this.options.locale);
        }

        getNavDate(): Date {
            return new Date(this.getProperty('navDate'));
        }

        getSeeAlso(): any {
            return Utils.getLocalisedValue(this.getProperty('seeAlso'), this.options.locale);
        }

        getLabel(): string {
            return Utils.getLocalisedValue(this.getProperty('label'), this.options.locale);
        }

        getTree(): ITreeNode{
            this.treeRoot = new TreeNode('root');
            this.treeRoot.data = this;
            return this.treeRoot;
        }

        load(): Promise<IIIIFResource> {
            var that = this;
            return new Promise<IIIIFResource>((resolve, reject) => {
                if (that.isLoaded) {
                    resolve(that);
                } else {
                    var options = that.options;
                    options.navDate = that.getNavDate();
                    Utils.loadResource(that.__jsonld['@id']).then(function(data) {
                        that.parentLabel = that.getLabel();

                        var parsed = Deserialiser.parse(data, options);
                        that = _assign(that, parsed);

                        // if this is in a collection, find the index of this item and assign it
                        if (that.parentCollection){
                            if (that.parentCollection.collections && that.parentCollection.collections.length){
                                that.index = _findIndex(that.parentCollection.collections, (r) => {
                                    return r.id === that.id;
                                });
                            } else {
                                that.index = _findIndex(that.parentCollection.manifests, (r) => {
                                    return r.id === that.id;
                                });
                            }
                        }

                        resolve(that);
                    });
                }
            });
        }
    }
}