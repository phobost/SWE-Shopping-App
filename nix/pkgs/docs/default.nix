{
  pkgs ? (import <nixpkgs> { }),
  lib ? pkgs.lib,
  ...
}:
let
  callPackage = lib.callPackageWith (pkgs // packages);
  packages = {
    proposal = callPackage ./proposal/package.nix {
      architecture = packages.architecture;
    };
    report = callPackage ./report/package.nix {
      architecture = packages.architecture;
    };
    architecture = callPackage ./architecture/package.nix { };
    project = callPackage ./project/package.nix { };
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
