{
  buildNpmPackage,
  importNpmLock,
  nodejs_latest,
  doCheck ? false,
}:
let
  src = ../.;
in
buildNpmPackage {
  name = "frontend";
  buildInputs = [
    nodejs_latest
  ];
  src = src;
  npmDeps = importNpmLock {
    npmRoot = src;
  };
  npmConfigHook = importNpmLock.npmConfigHook;
  inherit doCheck;
  checkPhase = ''
    npm run lint
  '';

  installPhase = ''
    mkdir -p "$out/share"
    cp -r dist/. "$out/share"/
  '';
}
