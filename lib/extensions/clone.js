var clone = module.exports = exports = function(typeToClone,target){
	function addMemberToTarget(member){
		target[member] = function(){
			return typeToClone[member].apply(typeToClone,arguments);
		};
	}

	for(var member in typeToClone){
		if(!target[member])
			addMemberToTarget(member);
	}
};

