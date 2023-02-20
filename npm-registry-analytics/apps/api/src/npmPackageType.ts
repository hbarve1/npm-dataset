export interface NpmPackageType {
  _id: string;
  _rev: string;
  'dist-tags': TypeDistTags;
  bugs: TypeBugs;
  description: string;
  distTags: TypeDistTags;
  homepage: string;
  keywords?: string[] | null;
  license: string;
  maintainers?: MaintainersEntityOrAuthorOrNpmUser[] | null;
  name: string;
  readme: string;
  readmeFilename: string;
  repository: TypeRepository;
  time: TypeTime;
  timeAsTimeline: TypeTime;
  users: TypeUsers;
  versions: TypeVersions;
  optionalDependencies?: TypeDependencies;
  peerDependencies?: TypeDependencies;
  peerDependenciesMeta?: TypeDependencies;
  dependencies?: TypeDependencies;
  devDependencies?: TypeDependencies;
  overrides?: TypeOverrides;
}
export interface TypeDistTags {
  [key: string]: string;
}
export interface TypeVersions {
  [key: string]: TypeVersion[];
}
export interface TypeVersion {
  _defaultsLoaded?: boolean;
  _engineSupported?: boolean;
  _from?: string;
  _id?: string;
  _inBundle?: boolean;
  _integrity?: string;
  _location?: string;
  _nodeVersion?: string;
  _npmOperationalInternal?: NpmOperationalInternal;
  _npmUser?: MaintainersEntityOrAuthorOrNpmUser;
  _npmVersion?: string;
  _phantomChildren?: PhantomChildren;
  _requested?: Requested;
  _requiredBy?: string[] | null;
  _resolved?: string;
  _shasum?: string;
  author?: MaintainersEntityOrAuthorOrNpmUser;
  browserify?: Browserify;
  bugs?: TypeBugs;
  buildInfo?: BuildInfo;
  dependencies?: TypeDependencies;
  deprecated?: string;
  description?: string;
  devDependencies?: TypeDependencies;
  directories?: Directories;
  dist?: Dist;
  engines?: Engines;
  files?: string[] | null;
  homepage?: string;
  keywords?: string[] | null;
  license?: string;
  licenses?: LicensesEntityOrRepository[] | null;
  main?: string;
  maintainers?: MaintainersEntityOrAuthorOrNpmUser[] | null;
  name: string;
  optionalDependencies?: TypeDependencies;
  peerDependencies?: TypeDependencies;
  repository?: LicensesEntityOrRepository;
  scripts?: Scripts;
  version?: string;
  overrides?: TypeOverrides;
}
export interface TypeOverrides {
  [key: string]: string | TypeOverrides;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Directories {}
export interface MaintainersEntityOrAuthorOrNpmUser {
  name: string;
  email: string;
}
export interface LicensesEntityOrRepository {
  type: string;
  url: string;
}
export interface TypeBugs {
  url: string;
}
export interface Engines {
  node: string;
  npm: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PhantomChildren {}
export interface Dist {
  shasum: string;
  tarball: string;
  integrity: string;
  signatures?: SignaturesEntity[] | null;
}
export interface SignaturesEntity {
  keyid: string;
  sig: string;
}
export interface TypeDependencies {
  [key: string]: string;
}
export interface DevDependencies {
  [key: string]: string;
}
export interface Scripts {
  [key: string]: string;
}
export interface Browserify {
  transform?: string[] | null;
}
export interface NpmOperationalInternal {
  host: string;
  tmp: string;
}
export interface BuildInfo {
  buildID: string;
  checksum: string;
  unstable: boolean;
  partial: boolean;
  packages?: string[] | null;
}
export interface Requested {
  type: string;
  registry: boolean;
  raw: string;
  name: string;
  escapedName: string;
  rawSpec: string;
  saveSpec?: null;
  fetchSpec: string;
}
export interface TypeRepository {
  type: string;
  url: string;
  directory: string;
}
export interface Exports {
  [key: string]: string | { [key: string]: string };
}
export interface TypeTime {
  modified: string;
  created: string;
  [key: string]: string;
}
export interface TypeUsers {
  [key: string]: boolean;
}
