import { IFile } from '@/store/pan'

class FileIcon {
  public static readonly Instance: FileIcon = new FileIcon()

  public FixFileIcon(m: IFile, ext: string, mime: string) {
    if (m.isdir) m.fileicon = 'iconfile-folder'
    else m.fileicon = this.GetFileIcon(ext, mime)

    if (this.IsVideo(ext, mime) !== '') m.isvideo = true
    else if (this.IsAudio(ext, mime) !== '') m.isaudio = true
    else if (this.IsImage(ext, mime) !== '') m.isimg = true
    else {
      m.istxt = m.fileicon === 'iconfile-txt' || m.fileicon === 'iconfile-html'
    }
    m.isdoc = !m.isdir && m.sizeint < 30 * 1024 * 1024 && ';.pdf;.xls;.xlsx;.ppt;.pptx;.doc;.docx;.rtf;.eio;.uof;.uos;'.indexOf(ext) >= 0

    m.canclick = m.isdir || m.isimg || m.isaudio || m.isvideo || m.istxt || m.isdoc
  }
  public GetFileIconByPath(filepath: string): string {
    if (filepath.indexOf('.') >= 0) {
      return this.GetFileIcon(filepath.substr(filepath.lastIndexOf('.')), '')
    } else return 'iconfile-file'
  }
  public GetFileIcon(ext: string, mime: string): string {
    if (ext === '.exe') return 'iconfile-exe'
    if (ext === '.torrent') return 'iconfile-bt'
    if (mime.startsWith('application/x-rar')) return 'iconfile-rar'
    if (mime === 'application/zip') return 'iconfile-zip'
    if (';.c.cpp.java.htm.html.css.js.vue.php.aspx.shtml.asp.jsp.json.url'.indexOf(ext) > 0) return 'iconfile-html'
    if (ext === '.txt' || ext === '.md' || ext === '.markdown' || ext === '.xml') return 'iconfile-txt'
    if (';.md5.ini.nfo.info.config.cfg.bat.sh.cmd.log.debug.go'.indexOf(ext) > 0) return 'iconfile-txt'
    if (ext === '.pdf') return 'iconfile-pdf'
    if (';.ppt.pptx.pot.potx.pps.dps.dpt'.indexOf(ext) > 0) return 'iconfile-ppt'
    if (';.xls.xlt.xlsx.xltx.et.ett'.indexOf(ext) > 0) return 'iconfile-xsl'
    if (';.doc.docx.dot.dotx.wps.wpt.rtf.uof.uos'.indexOf(ext) > 0) return 'iconfile-doc'
    if (this.IsZiMu(ext) !== '') return this.IsZiMu(ext)
    if (this.IsZip(ext) !== '') return this.IsZip(ext)
    if (this.IsDisk(ext) !== '') return this.IsDisk(ext)
    if (this.IsVideo(ext, mime) !== '') return this.IsVideo(ext, mime)
    if (this.IsAudio(ext, mime) !== '') return this.IsAudio(ext, mime)
    if (this.IsImage(ext, mime) !== '') return this.IsImage(ext, mime)

    return 'iconfile-file'
  }

  private IsZiMu(ext: string) {
    let fileicon = ''
    if (ext === '.ssa') fileicon = 'iconfile-ssa'
    else if (ext === '.ass') fileicon = 'iconfile-ass'
    else if (ext === '.srt') fileicon = 'iconfile-srt'
    else if (ext === '.stl') fileicon = 'iconfile-stl'
    else if (ext === '.scc') fileicon = 'iconfile-scc'
    return fileicon
  }

  private IsZip(ext: string) {
    let fileicon = ''
    if (ext === '.7z' || ext === '.7zip' || ext === '.7-zip') fileicon = 'iconfile-7z'
    else if (ext === '.zip') fileicon = 'iconfile-zip'
    else if (ext === '.rar' || ext.startsWith('.part')) fileicon = 'iconfile-rar'
    else if (ext === '.tar') fileicon = 'iconfile-tar'
    else if (ext.startsWith('.z0') || ext.startsWith('.z1') || ext.startsWith('.z2') || ext.startsWith('.z3') || ext.startsWith('.z4') || ext.startsWith('.z5') || ext.startsWith('.z6') || ext.startsWith('.z7') || ext.startsWith('.z8') || ext.startsWith('.z9')) fileicon = 'iconfile-zip'
    else if (';.bz2.bzip2.cab.lzma.gz.gzip.tgz.taz.xar.arj.lzh.ace.uue.bz2.jar'.indexOf(ext) > 0 || ext.startsWith('.0') || ext.startsWith('.1') || ext.startsWith('.2') || ext.startsWith('.3')) fileicon = 'iconfile-zip'
    return fileicon
  }

  private IsDisk(ext: string) {
    let fileicon = ''
    if (ext === '.vmdk') fileicon = 'iconfile-vmdk'
    else if (ext === '.img') fileicon = 'iconfile-img2'
    else if (ext === '.nsp') fileicon = 'iconfile-nsp'
    else if (ext === '.xci') fileicon = 'iconfile-xci'
    else if (ext === '.bin') fileicon = 'iconfile-bin'
    else if (ext === '.dmg') fileicon = 'iconfile-dmg'
    else if (ext === '.vhd') fileicon = 'iconfile-vhd'
    else if (ext === '.mds') fileicon = 'iconfile-mds'
    else if (ext === '.iso') fileicon = 'iconfile-iso'
    else if (ext === '.gho') fileicon = 'iconfile-gho'
    else if (ext === '.god') fileicon = 'iconfile-god'
    return fileicon
  }

  private IsImage(ext: string, mime: string) {
    let fileicon = ''
    if (ext === '.bmp') fileicon = 'iconfile-bmp'
    else if (ext === '.jpg' || ext === '.jpeg' || ext === '.jp2' || ext === '.jpeg2000') fileicon = 'iconfile-jpg'
    else if (ext === '.png') fileicon = 'iconfile-png'
    else if (ext === '.gif') fileicon = 'iconfile-gif'
    else if (ext === '.svg') fileicon = 'iconfile-svg'
    else if (ext === '.psd') fileicon = 'iconfile-psd'
    else if (ext === '.ai') fileicon = 'iconfile-ai'
    else if (ext === '.tif' || ext === '.tiff') fileicon = 'iconfile-tif'
    else if (ext === '.eps') fileicon = 'iconfile-eps'
    else if (ext === '.psd') fileicon = 'iconfile-psd'
    else if (';.webp.pcx.tga.exif.fpx.cdr.pcd.dxf.ufo.raw.ico.hdri.wmf'.indexOf(ext) > 0) fileicon = 'iconfile-image'
    else if (mime.startsWith('image')) fileicon = 'iconfile-image'
    return fileicon
  }

  private IsVideo(ext: string, mime: string) {
    let fileicon = ''
    if (ext === '.avi' || ext === '.avi1') fileicon = 'iconfile-avi'
    else if (ext === '.flv' || ext === '.flv1' || ext === '.f4v') fileicon = 'iconfile-flv'
    else if (ext === '.mkv' || ext === '.mkv1') fileicon = 'iconfile-mkv'
    else if (ext === '.mp4' || ext === '.mp41' || ext === '.m4v') fileicon = 'iconfile-mp4'
    else if (ext === '.mov') fileicon = 'iconfile-mov'
    else if (ext === '.swf') fileicon = 'iconfile-swf'
    else if (ext === '.asf') fileicon = 'iconfile-asf'
    else if (ext === '.wmv' || ext === '.wmv1') fileicon = 'iconfile-wmv'
    else if (ext === '.ts' || ext === '.ts1' || ext === '.m2ts' || ext === '.mts') fileicon = 'iconfile-ts'
    else if (ext === '.rmvb' || ext === '.rm') fileicon = 'iconfile-rmvb'
    else if (';.m2t.m2v.mp2v.mpe.mpeg.mpg.mpv2.3g2.3gp.3gp2.3gpp.amr.amv.divx.dpg.dvr-ms.evo.ifo.k3g.m1v.m4b.m4p.mxf.nsr.nsv.ogm.ogv.qt.ram.rpm.skm.tp.tpr.trp.vob.webm.wm.wmo.wtv'.indexOf(ext) > 0) fileicon = 'iconfile-video'
    else if (mime.startsWith('video')) fileicon = 'iconfile-video'

    return fileicon
  }

  private IsAudio(ext: string, mime: string) {
    let fileicon = ''
    if (ext === '.mp3') fileicon = 'iconfile-mp3'
    else if (ext === '.flac') fileicon = 'iconfile-flac'
    else if (ext === '.wav') fileicon = 'iconfile-wav'
    else if (ext === '.cue') fileicon = 'iconfile-cue'
    else if (ext === '.ogg') fileicon = 'iconfile-ogg'
    else if (ext === '.ape') fileicon = 'iconfile-ape'
    else if (';.aac.ac3.aiff.cda.dsf.dts.dtshd.eac3.m1a.m2a.m4a.mka.mod.mp2.mpa.mpc.ogg.opus.ra.tak.tta.wma.wv'.indexOf(ext) > 0) fileicon = 'iconfile-audio'
    else if (mime.startsWith('audio')) fileicon = 'iconfile-audio'
    return fileicon
  }
}
export default FileIcon.Instance
