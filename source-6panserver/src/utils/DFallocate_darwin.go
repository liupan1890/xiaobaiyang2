// +build darwin

package utils

import (
	"os"
	"syscall"
	"unsafe"
)

func IsWindows() bool {
	return false
}
func IsLinux() bool {
	return false
}
func IsDarwin() bool {
	return true
}
func DFallocate(f *os.File, size int64) error {
	stat, err := f.Stat()
	if err != nil {
		return err
	}

	cursize := int64(stat.Sys().(*syscall.Stat_t).Blocks * 512)
	if size <= cursize {
		return nil
	}

	store := &syscall.Fstore_t{
		Flags:   syscall.F_ALLOCATEALL,
		Posmode: syscall.F_PEOFPOSMODE,
		Offset:  0,
		Length:  int64(size - cursize),
	}

	_, _, errno := syscall.Syscall(syscall.SYS_FCNTL, uintptr(f.Fd()), syscall.F_PREALLOCATE, uintptr(unsafe.Pointer(store)))
	if errno != 0 {
		return errno
	}

	return nil
}
