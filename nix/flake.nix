{
  description = "SWE Shopping App";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs =
    inputs@{
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
          docs = lib.attrsets.mapAttrs' (
            pkgName: pkgVal: lib.attrsets.nameValuePair "docs-${pkgName}" pkgVal
          ) cpkgs.docs;
        in
        {
          frontend-website = pkgs.callPackage ../src/frontend/nix/website/package.nix { };
          frontend-functions = pkgs.callPackage ../src/frontend/nix/functions/package.nix { };
          backend = inputs.backend.packages.${pkgs.stdenv.hostPlatform.system}.default;
        }
        // docs
      );
      formatter = clib.eachSystem (
        pkgs: treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.wrapper
      );
      checks = clib.eachSystem (
        pkgs:
        {
          formatting = treefmtEval.${pkgs.stdenv.hostPlatform.system}.config.build.check ../.;
          frontend-website = pkgs.callPackage ../src/frontend/nix/website/package.nix {
            doCheck = true;
          };
          frontend-functions = pkgs.callPackage ../src/frontend/nix/functions/package.nix {
            doCheck = true;
          };
        }
        // (lib.attrsets.mapAttrs' (
          name: value: (lib.attrsets.nameValuePair "phobost-backend-${name}" value)
        ) inputs.backend.checks.${pkgs.stdenv.hostPlatform.system})
      );
      nixosModules = {
        phobost-api = inputs.backend.nixosModules.phobost;
      };
    };
}
