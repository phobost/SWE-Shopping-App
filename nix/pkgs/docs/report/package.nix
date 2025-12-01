{
  pkgs,
  architecture,
  fonts ? with pkgs; [
    roboto
    twitter-color-emoji
    nerd-fonts.symbols-only
    vista-fonts
    ibm-plex
  ],
}:

pkgs.stdenvNoCC.mkDerivation {
  name = "Compile report";
  src = ../../../../docs/report;
  buildInputs = [
    pkgs.typst
  ];
  TYPST_FONT_PATHS = pkgs.lib.concatStringsSep ":" fonts;
  buildPhase = ''
    cp "${architecture}/arch.svg" assets/architecture-diagram.svg
    typst compile *.typ proposal.pdf;
  '';
  installPhase = ''
    mkdir -p "$out"
    rm -rf "$out/*" | true
    cp report.pdf $out/
  '';
}
