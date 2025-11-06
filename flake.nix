{
  description = "SWE Shopping App";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    ext.url = ./nix;
  };
  outputs =
    inputs@{
      nixpkgs,
      ...
    }:
    let
      clib = import ./nix/lib { inherit nixpkgs; };
      lib = nixpkgs.lib;
    in
    {
      formatter = inputs.ext.formatter;
      checks = inputs.ext.checks;
      packages = inputs.ext.packages;
      devShells = clib.eachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nix
            zsh
          ];
        };
      });
      nixosModules = inputs.ext.nixosModules;
    };
}
