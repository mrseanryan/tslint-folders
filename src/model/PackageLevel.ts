// The level of a package, sorted from highest to lowest.
// In general, a package can only import from a *lower* level (not from same or higher level).
//
// For clarity, we intentionally avoid abstract levels.
export enum PackageLevel {
  Shell,
  Area,
  Grid,
  Utils,
  ThirdParty
}
