// +build linux

package utils

import (
	"os"
	"syscall"
)

func IsWindows() bool {
	return false
}
func IsLinux() bool {
	return true
}
func IsDarwin() bool {
	return false
}
func DFallocate(f *os.File, size int64) error {
	stat, err := f.Stat()
	if err != nil {
		return err
	}
	if stat.Size() > size {
		return nil
	}
	return syscall.Fallocate(int(f.Fd()), 0, 0, size)
}
