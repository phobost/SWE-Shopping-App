{
  description = "Build a cargo project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    flake-utils.url = "github:numtide/flake-utils";

    advisory-db = {
      url = "github:rustsec/advisory-db";
      flake = false;
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      crane,
      fenix,
      flake-utils,
      advisory-db,
      ...
    }:

    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        inherit (pkgs) lib;

        craneLib = crane.mkLib pkgs;

        src = ./.;

        # Common arguments can be set here to avoid repeating them later
        commonArgs = {
          inherit src;
          strictDeps = true;

          nativeBuildInputs = [ pkgs.pkg-config ];

          buildInputs = [
            # Add additional build inputs here
            pkgs.openssl
          ]
          ++ lib.optionals pkgs.stdenv.isDarwin [
            # Additional darwin specific inputs
            pkgs.libiconv
            pkgs.darwin.apple_sdk.frameworks.Security
          ];
        };

        craneLibLLvmTools = craneLib.overrideToolchain (
          fenix.packages.${system}.complete.withComponents [
            "cargo"
            "llvm-tools"
            "rustc"
          ]
        );

        # Build *just* the cargo dependencies, so we can reuse
        # all of that work (e.g. via cachix) when running in CI
        cargoArtifacts = craneLib.buildDepsOnly commonArgs;

        # Build the actual crate itself, reusing the dependency
        # artifacts from above.
        api = craneLib.buildPackage (
          commonArgs
          // {
            inherit cargoArtifacts;
            # Skip the tests due to deps on Sqlx and a valid DB
            doCheck = false;

            nativeBuildInputs = (commonArgs.nativeBuildInputs or [ ]);
          }
        );
      in
      {
        checks = {
          # Build the crate as part of `nix flake check` for convenience
          inherit api;

          # Run clippy (and deny all warnings) on the crate source,
          # again, reusing the dependency artifacts from above.
          #
          # Note that this is done as a separate derivation so that
          # we can block the CI if there are issues here, but not
          # prevent downstream consumers from building our crate by itself.
          clippy = craneLib.cargoClippy (
            commonArgs
            // {
              inherit cargoArtifacts;
              cargoClippyExtraArgs = "--all-targets -- --deny warnings";
            }
          );

          doc = craneLib.cargoDoc (commonArgs // { inherit cargoArtifacts; });

          # Check formatting
          fmt = craneLib.cargoFmt { inherit src; };

          # Audit dependencies
          audit = craneLib.cargoAudit { inherit src advisory-db; };

          # Audit licenses
          # deny = craneLib.cargoDeny { inherit src; };

          # Run tests with cargo-nextest
          # Consider setting `doCheck = false` on `api` if you do not want
          # the tests to run twice
          nextest = craneLib.cargoNextest (
            commonArgs
            // {
              inherit cargoArtifacts;
              partitions = 1;
              partitionType = "count";
            }
          );
        };

        packages = {
          api = api;
          default = api;
        }
        // lib.optionalAttrs (!pkgs.stdenv.isDarwin) {
          api-llvm-coverage = craneLibLLvmTools.cargoLlvmCov (commonArgs // { inherit cargoArtifacts; });
        };

        apps.default = flake-utils.lib.mkApp { drv = api; };

        devShells.default = craneLib.devShell {
          checks = self.checks.${system};

          PKG_CONFIG_PATH = "${pkgs.openssl.dev}/lib/pkgconfig";
          nativeBuildInputs = [ pkgs.pkg-config ];
          buildInputs = [
            pkgs.openssl
            pkgs.openssl.dev
          ];

          packages = with pkgs; [
            cargo
            cargo-watch
            bunyan-rs
          ];
        };

      }
    )
    // {
      nixosModules = rec {
        default = phobost;
        phobost =
          {
            config,
            lib,
            pkgs,
            ...
          }:
          let
            cfg = config.services.phobost-api;
          in
          {
            options.services.phobost-api = {
              enable = lib.mkEnableOption "Enable the phobost-api service";
              host = lib.mkOption {
                type = lib.types.str;
                default = "127.0.0.1";
                description = ''
                  The host to pass to phobost
                '';
              };
              port = lib.mkOption {
                type = lib.types.port;
                default = 8000;
                description = ''
                  The port to run the phobost API on
                '';
              };

              package = lib.mkOption {
                type = lib.types.package;
                default = self.packages.${pkgs.stdenv.hostPlatform.system}.api;
                description = "Package to use for the API, defaults to the package provided in the flake";
              };
            };

            config = lib.mkIf cfg.enable {
              systemd.services.phobost-api = {
                wantedBy = [ "multi-user.target" ];
                environment = {
                  APP_HOST = cfg.host;
                  APP_PORT = builtins.toString cfg.port;
                };
                serviceConfig = {
                  DynamicUser = true;
                  ExecStart = lib.getExe cfg.package;
                  Restart = "on-failure";
                  RestartSec = "5s";
                };
              };
            };
          };
      };
    };
}
