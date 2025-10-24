{
  buildNpmPackage,
  importNpmLock,
  nodejs_latest,
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

  installPhase = ''
    mkdir -p "$out/share"
    cp -r dist/. "$out/share"/
  '';
}
