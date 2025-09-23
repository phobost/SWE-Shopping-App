{
  lib,
  stdenvNoCC,
  d2,
}:

let
  arch-file = ../../../../docs/Architecture.d2;
in
stdenvNoCC.mkDerivation {
  name = "${arch-file}";
  src = [
  ];
  buildInputs = [
    d2
  ];
  unpackPhase = ''
    cp "${arch-file}" arch.d2
  '';
  buildPhase = ''
    d2 arch.d2 arch.svg;
  '';
  installPhase = ''
    mkdir -p "$out"
    rm -rf "$out/*" | true
    cp *.svg $out/
  '';
}
