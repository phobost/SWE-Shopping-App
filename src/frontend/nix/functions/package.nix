{
  buildNpmPackage,
  importNpmLock,
  nodejs_latest,
  doCheck ? false,
}:
let
  src = ../../functions;
  root = ../..;
in
buildNpmPackage {
  name = "functions";
  buildInputs = [
    nodejs_latest
  ];
  src = ../..;
  npmDeps = importNpmLock {
    npmRoot = ../../functions;
  };
  npmConfigHook = importNpmLock.npmConfigHook;
  # Copy necessary files from parent before building

  buildPhase = ''
    cd functions
    npm run build
    cd ..
  '';

  installPhase = ''
    mkdir -p "$out/share"
    cp -r functions/lib/. "$out/share"/
  '';

  inherit doCheck;
}
