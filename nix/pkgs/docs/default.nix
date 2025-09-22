{
  pkgs ? (import <nixpkgs> { }),
  lib ? pkgs.lib,
  ...
}:
let
  callPackage = lib.callPackageWith (pkgs // packages);
  packages = {
    proposal = callPackage ./proposal/package.nix { };
    architecture = callPackage ./architecture/package.nix { };
  };
  all = pkgs.symlinkJoin {
    name = "docs";
    paths = builtins.attrValues packages;
  };
in
packages
// {
  inherit all;
}
