{
  pkgs ? (import <nixpkgs> { }),
  lib ? pkgs.lib,
  ...
}:
let
  importPkgSet =
    dir:
    (import dir {
      inherit pkgs;
      inherit lib;
    });
  packages = {
    docs = importPkgSet ./docs;
  };
in
packages
