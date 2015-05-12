# version 1.1
# vm-control.py untuk xenserver dengan setup resource pool

import commands, sys

# set pool master
pool_master = 'xenserver-zero'

def findBestHost(pool_master):
	best_freemem = 0
	best_host = ''
	# get all host in this pool
	gethosts = commands.getoutput('xe host-list --minimal')
	host_uuids = gethosts.split(',')
	for host in host_uuids:
		# get free memory of this host
		freemem = commands.getoutput('xe host-compute-free-memory host=%s' % (host))
		mtotal = commands.getoutput('xe host-param-get uuid=%s param-name=memory-total host-metrics-live=true' % (host))
		freemem_percent = 100*int(freemem)/int(mtotal)
		if freemem_percent >= best_freemem:
			best_freemem = freemem_percent
			best_host = host
	# return best host uuid
	return best_host

if __name__ == '__main__':
	if len(sys.argv) == 3:
		uuid = sys.argv[2]
		if sys.argv[1] == 'start':
			# find out current best host
			bestHost_uuid = findBestHost(pool_master)
			# start vm in this best host
			res, output = commands.getstatusoutput('xe vm-start vm=%s on=%s' % (uuid, bestHost_uuid))
			# if error occured
			if res:
				sys.exit(output)
		elif sys.argv[1] == 'stop':
			res, output = commands.getstatusoutput('xe vm-shutdown vm=%s' % (uuid))
			if res:
				sys.exit(output)
		elif sys.argv[1] == 'reboot':
			res, output = commands.getstatusoutput('xe vm-reboot vm=%s' % (uuid))
			if res:
				sys.exit(output)
		elif sys.argv[1] == 'uninstall':
			res, output = commands.getstatusoutput('xe vm-uninstall vm=%s' % (uuid))
			if res:
				sys.exit(output)
	else:
		print "usage: %s cmd vm_uuid" % sys.argv[0]
		print "List of available commands:"
		print "start - start vm"
		print "stop - stop vm"
		print "reboot - reboot vm"
		print "uninstall - uninstall vm"