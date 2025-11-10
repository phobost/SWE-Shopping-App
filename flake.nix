{
  description = "SWE Shopping App";
  nixConfig = {
    experimental-features = [
      "pipe-operators"
      "nix-command"
      "flakes"
    ];
  };
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
      apps = clib.eachSystem (pkgs: {
        init-hooks = {
          type = "app";
          meta.description = "Create git pre-commit hook";
          program =
            let
              pre-commit-script =
                pkgs.writeShellApplication {
                  name = "pre-commit";
                  runtimeInputs = with pkgs; [
                    git
                  ];
                  text = ''
                    set -eEuo pipefail

                    BASE_DIR="$(git rev-parse --show-toplevel)"
                    (
                      cd "$BASE_DIR"
                      nix flake check
                    )
                  '';
                }
                |> lib.getExe;
            in
            pkgs.writeShellApplication {
              name = "write-pre-commit-flake-check";
              runtimeInputs = with pkgs; [
                git
              ];
              text = ''
                set -eEuo pipefail

                GIT_HOOKS_DIR="$(git rev-parse --git-path hooks)"
                PRE_COMMIT_FILE="$GIT_HOOKS_DIR/pre-commit"

                if [[ -e "$PRE_COMMIT_FILE" && (! -L "$PRE_COMMIT_FILE" || "$(readlink "$PRE_COMMIT_FILE")" != "${pre-commit-script}") ]]; then
                  echo "pre-commit hook already exists at '$PRE_COMMIT_FILE', refusing to overwrite!"
                  exit 1
                else
                  ln -sf "${pre-commit-script}" "$PRE_COMMIT_FILE"
                fi

                echo "Git Hooks Initialized"
              '';

            }
            |> lib.meta.getExe;

        };
      });
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
