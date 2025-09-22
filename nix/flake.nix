{
  description = "SWE Shopping App";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };
  outputs =
    inputs@{
      self,
      nixpkgs,
      ...
    }:
    let
      clib = import ./lib { inherit nixpkgs; };
      lib = nixpkgs.lib;
      treefmtEval = clib.eachSystem (pkgs: inputs.treefmt-nix.lib.evalModule pkgs ./treefmt.nix);
    in
    {
      packages = clib.eachSystem (
        pkgs:
        let
          cpkgs = (import ./pkgs { inherit pkgs; });
          # We want to prefix the package names to make it clear what specific package they are
          #
          # For example if the package comes from the `docs` packages then it should be prefixed with `doc-`
          allPkgs = lib.foldlAttrs (
            acc: prefix: value:
            let
              prefixedPkg = lib.attrsets.mapAttrs' (
                pkgName: pkgValue: lib.attrsets.nameValuePair "${prefix}-${pkgName}" pkgValue
              ) value;
            in
            acc // prefixedPkg
          ) { } cpkgs;
        in
        allPkgs
      );
      formatter = clib.eachSystem (pkgs: treefmtEval.${pkgs.system}.config.build.wrapper);
      checks = clib.eachSystem (pkgs: {
        formatting = treefmtEval.${pkgs.system}.config.build.check self;
      });
    };
}
